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

        """Generate Plotly chart configuration - defaults to bar chart"""
        if not data:
            return {}
        
        # Serialize data first to handle datetime objects
        serialized_data = serialize_for_json(data)
        columns = list(serialized_data[0].keys())
        
        # Default bar chart configuration
        chart_config = {
            "data": [{
                "x": [row[columns[0]] for row in serialized_data],
                "y": [row[columns[1]] for row in serialized_data] if len(columns) > 1 else [1] * len(serialized_data),
                "type": "bar",
                "name": columns[1] if len(columns) > 1 else "Count",
                "marker": {
                    "color": "rgba(54, 162, 235, 0.8)",
                    "line": {
                        "color": "rgba(54, 162, 235, 1)",
                        "width": 1
                    }
                }
            }],
            "layout": {
                "title": {
                    "text": "Query Results",
                    "font": {"size": 18}
                },
                "xaxis": {
                    "title": columns[0],
                    "showgrid": True,
                    "gridcolor": "rgba(128, 128, 128, 0.2)"
                },
                "yaxis": {
                    "title": columns[1] if len(columns) > 1 else "Count",
                    "showgrid": True,
                    "gridcolor": "rgba(128, 128, 128, 0.2)"
                },
                "plot_bgcolor": "white",
                "paper_bgcolor": "white",
                "margin": {"l": 60, "r": 40, "t": 80, "b": 60},
                "hovermode": "x unified"
            }
        }
        
        # Special handling only for specific cases
        if len(columns) >= 2:
            first_col_values = [row[columns[0]] for row in serialized_data]
            second_col_values = [row[columns[1]] for row in serialized_data]
            
            # ONLY pie chart for very small categorical data
            if (len(serialized_data) <= 5 and 
                all(isinstance(val, (int, float)) for val in second_col_values) and
                all(val >= 0 for val in second_col_values) and
                not any(keyword in columns[0].lower() for keyword in ['date', 'time', 'month', 'year'])):
                chart_config = {
                    "data": [{
                        "labels": first_col_values,
                        "values": second_col_values,
                        "type": "pie",
                        "hole": 0.3,
                        "textinfo": "label+percent",
                        "textposition": "outside"
                    }],
                    "layout": {
                        "title": {
                            "text": "Distribution",
                            "font": {"size": 18}
                        },
                        "margin": {"l": 60, "r": 60, "t": 80, "b": 60}
                    }
                }
            
            # For long labels, use horizontal bar chart
            elif any(len(str(val)) > 15 for val in first_col_values) or len(serialized_data) > 20:
                chart_config["data"][0].update({
                    "orientation": "h",
                    "x": second_col_values,
                    "y": first_col_values
                })
                # Swap axis titles for horizontal orientation
                chart_config["layout"]["xaxis"]["title"] = columns[1] if len(columns) > 1 else "Count"
                chart_config["layout"]["yaxis"]["title"] = columns[0]
                chart_config["layout"]["height"] = max(400, len(serialized_data) * 25)
        
        # Always keep as bar chart - remove the time series detection
        return chart_config



