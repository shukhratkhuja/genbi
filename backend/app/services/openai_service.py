import openai
from typing import Dict, Any, List
from app.core.config import settings
import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.utils.helpers import serialize_for_json

class OpenAIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    def _generate_sql_sync(self, natural_query: str, table_schemas: str) -> str:
        """Synchronous SQL generation"""
        system_prompt = f"""You are an expert SQL generator. Convert natural language queries to SQL.
        
Database Schema:
{table_schemas}

Rules:
1. Generate only valid SQL SELECT statements
2. Use proper table and column names from the schema
3. Include appropriate JOINs when needed
4. Use appropriate WHERE clauses for filtering
5. Include GROUP BY and ORDER BY when relevant
6. Return only the SQL query, no explanations
7. Use double quotes for identifiers if needed
8. Ensure the query is PostgreSQL compatible
"""
        
        user_prompt = f"Convert this natural language query to SQL: {natural_query}"
        
        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            sql_query = response.choices[0].message.content.strip()
            
            # Clean up the SQL
            if sql_query.startswith("```sql"):
                sql_query = sql_query[6:]
            if sql_query.endswith("```"):
                sql_query = sql_query[:-3]
            
            return sql_query.strip()
            
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return f"-- Error generating SQL: {str(e)}"
    
    async def generate_sql(self, natural_query: str, table_schemas: str) -> str:
        """Async wrapper for SQL generation"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor, 
            self._generate_sql_sync, 
            natural_query, 
            table_schemas
        )
    
    def _generate_insights_sync(self, query: str, data: List[Dict[str, Any]]) -> str:
        """Synchronous insights generation"""
        if not data:
            return "No data returned from the query."
        
        # Serialize data for proper JSON handling
        serialized_data = serialize_for_json(data)
        
        data_summary = f"Query: {query}\n\nResults ({len(serialized_data)} rows):\n"
        for i, row in enumerate(serialized_data[:5]):
            data_summary += f"Row {i+1}: {row}\n"
        
        if len(serialized_data) > 5:
            data_summary += f"... and {len(serialized_data) - 5} more rows\n"
        
        system_prompt = """You are a data analyst AI. Analyze the query results and provide insightful observations.

Provide:
1. Key findings and trends
2. Notable patterns or anomalies
3. Business insights if applicable
4. Recommendations based on the data

Keep your response concise but informative (2-3 sentences max)."""

        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": data_summary}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"Unable to generate insights: {str(e)}"
    
    async def generate_insights(self, query: str, data: List[Dict[str, Any]]) -> str:
        """Async wrapper for insights generation"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor, 
            self._generate_insights_sync, 
            query, 
            data
        )
        
    async def generate_chart_config(self, data: List[Dict[str, Any]], query: str) -> Dict[str, Any]:
        """Generate chart configuration with better detection"""
        if not data:
            return {}
        
        # Serialize data first to handle datetime objects
        serialized_data = serialize_for_json(data)
        columns = list(serialized_data[0].keys())
        
        print(f"Generating chart for {len(serialized_data)} records with columns: {columns}")
        
        # Analyze data to determine best chart type
        chart_type = "bar"  # default
        
        if len(columns) >= 2:
            first_col_values = [row[columns[0]] for row in serialized_data]
            second_col_values = [row[columns[1]] for row in serialized_data]
            
            # Check if second column is numeric
            is_numeric = all(isinstance(val, (int, float)) or (isinstance(val, str) and val.replace('.', '').replace('-', '').isdigit()) for val in second_col_values)
            
            print(f"Second column numeric: {is_numeric}")
            print(f"Data length: {len(serialized_data)}")
            print(f"First column sample: {first_col_values[:3]}")
            print(f"Second column sample: {second_col_values[:3]}")
            
            # Convert numeric strings to numbers
            if is_numeric:
                second_col_values = [float(val) if isinstance(val, str) else val for val in second_col_values]
            
            # Determine chart type based on data characteristics
            if (len(serialized_data) <= 8 and 
                is_numeric and 
                all(val >= 0 for val in second_col_values) and
                not any(keyword in columns[0].lower() for keyword in ['date', 'time', 'month', 'year', 'day'])):
                chart_type = "pie"
            elif any(keyword in columns[0].lower() for keyword in ['date', 'time', 'month', 'year']):
                chart_type = "line"
            else:
                chart_type = "bar"
        
        print(f"Selected chart type: {chart_type}")
        
        # Generate configuration based on chart type
        if chart_type == "pie":
            config = {
                "data": [{
                    "labels": [str(row[columns[0]]) for row in serialized_data],
                    "values": [float(row[columns[1]]) if isinstance(row[columns[1]], (str, int, float)) else 0 for row in serialized_data],
                    "type": "pie",
                    "hole": 0.3,
                    "textinfo": "label+percent",
                    "textposition": "outside"
                }],
                "layout": {
                    "title": {
                        "text": f"{columns[1]} by {columns[0]}",
                        "font": {"size": 16}
                    },
                    "margin": {"l": 60, "r": 60, "t": 80, "b": 60},
                    "showlegend": True
                }
            }
        
        elif chart_type == "line":
            config = {
                "data": [{
                    "x": [str(row[columns[0]]) for row in serialized_data],
                    "y": [float(row[columns[1]]) if isinstance(row[columns[1]], (str, int, float)) else 0 for row in serialized_data],
                    "type": "scatter",
                    "mode": "lines+markers",
                    "name": columns[1],
                    "line": {"color": "rgb(54, 162, 235)", "width": 3},
                    "marker": {"color": "rgb(54, 162, 235)", "size": 6}
                }],
                "layout": {
                    "title": {
                        "text": f"{columns[1]} over {columns[0]}",
                        "font": {"size": 16}
                    },
                    "xaxis": {
                        "title": columns[0],
                        "showgrid": True,
                        "gridcolor": "rgba(128, 128, 128, 0.2)"
                    },
                    "yaxis": {
                        "title": columns[1],
                        "showgrid": True,
                        "gridcolor": "rgba(128, 128, 128, 0.2)"
                    },
                    "plot_bgcolor": "white",
                    "paper_bgcolor": "white",
                    "margin": {"l": 60, "r": 40, "t": 80, "b": 60}
                }
            }
        
        else:  # bar chart
            # Check if we need horizontal bars (long labels or many items)
            first_col_values = [str(row[columns[0]]) for row in serialized_data]
            use_horizontal = (any(len(label) > 12 for label in first_col_values) or 
                            len(serialized_data) > 15)
            
            if use_horizontal:
                config = {
                    "data": [{
                        "x": [float(row[columns[1]]) if isinstance(row[columns[1]], (str, int, float)) else 0 for row in serialized_data],
                        "y": first_col_values,
                        "type": "bar",
                        "orientation": "h",
                        "name": columns[1],
                        "marker": {
                            "color": "rgba(54, 162, 235, 0.8)",
                            "line": {"color": "rgba(54, 162, 235, 1)", "width": 1}
                        }
                    }],
                    "layout": {
                        "title": {
                            "text": f"{columns[1]} by {columns[0]}",
                            "font": {"size": 16}
                        },
                        "xaxis": {
                            "title": columns[1],
                            "showgrid": True,
                            "gridcolor": "rgba(128, 128, 128, 0.2)"
                        },
                        "yaxis": {
                            "title": columns[0],
                            "showgrid": True,
                            "gridcolor": "rgba(128, 128, 128, 0.2)"
                        },
                        "plot_bgcolor": "white",
                        "paper_bgcolor": "white",
                        "margin": {"l": 120, "r": 40, "t": 80, "b": 60},
                        "height": max(400, len(serialized_data) * 30)
                    }
                }
            else:
                config = {
                    "data": [{
                        "x": first_col_values,
                        "y": [float(row[columns[1]]) if isinstance(row[columns[1]], (str, int, float)) else 0 for row in serialized_data],
                        "type": "bar",
                        "name": columns[1],
                        "marker": {
                            "color": "rgba(54, 162, 235, 0.8)",
                            "line": {"color": "rgba(54, 162, 235, 1)", "width": 1}
                        }
                    }],
                    "layout": {
                        "title": {
                            "text": f"{columns[1]} by {columns[0]}",
                            "font": {"size": 16}
                        },
                        "xaxis": {
                            "title": columns[0],
                            "showgrid": True,
                            "gridcolor": "rgba(128, 128, 128, 0.2)"
                        },
                        "yaxis": {
                            "title": columns[1],
                            "showgrid": True,
                            "gridcolor": "rgba(128, 128, 128, 0.2)"
                        },
                        "plot_bgcolor": "white",
                        "paper_bgcolor": "white",
                        "margin": {"l": 60, "r": 40, "t": 80, "b": 60}
                    }
                }
        
        print(f"Generated config: {config}")
        return config