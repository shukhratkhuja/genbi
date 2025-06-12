import openai
from typing import Dict, Any, List, Tuple
from app.core.config import settings
import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.utils.helpers import serialize_for_json
import re

class OpenAIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Language patterns for detection
        self.language_patterns = {
            'uzbek': [
                r'\b(nima|qanday|qachon|qayerda|kim|necha|soni|raqami|hisobot|ma\'lumot|jadval|ro\'yxat)\b',
                r'\b(ko\'rsatish|topish|aniqlash|hisoblash|tahlil|statistika)\b',
                r'\b(yil|oy|kun|sana|vaqt|soat|minut)\b'
            ],
            'russian': [
                r'\b(что|какой|когда|где|кто|сколько|количество|число|отчет|данные|таблица|список)\b',
                r'\b(показать|найти|определить|посчитать|анализ|статистика)\b',
                r'\b(год|месяц|день|дата|время|час|минута)\b'
            ],
            'english': [
                r'\b(what|which|when|where|who|how many|count|number|report|data|table|list)\b',
                r'\b(show|find|determine|calculate|analysis|statistics)\b',
                r'\b(year|month|day|date|time|hour|minute)\b'
            ]
        }
        
        # Date-related column patterns
        self.date_column_patterns = [
            r'.*date.*', r'.*time.*', r'.*created.*', r'.*updated.*', 
            r'.*modified.*', r'.*birth.*', r'.*start.*', r'.*end.*',
            r'.*expires.*', r'.*published.*', r'.*registered.*'
        ]
    
    def _detect_language(self, text: str) -> str:
        """Detect the language of the input text"""
        text_lower = text.lower()
        
        scores = {'uzbek': 0, 'russian': 0, 'english': 0}
        
        for lang, patterns in self.language_patterns.items():
            for pattern in patterns:
                matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
                scores[lang] += matches
        
        # Return language with highest score, default to english
        detected = max(scores.keys(), key=lambda k: scores[k])
        return detected if scores[detected] > 0 else 'english'
    
    def _analyze_table_relevance(self, natural_query: str, table_schemas: str) -> List[Tuple[str, float]]:
        """Analyze which tables are most relevant to the query"""
        query_lower = natural_query.lower()
        tables_info = []
        
        # Parse table schemas to extract table information
        current_table = None
        current_columns = []
        
        for line in table_schemas.split('\n'):
            if line.startswith('Table: '):
                if current_table:
                    tables_info.append((current_table, current_columns))
                current_table = line.replace('Table: ', '').strip()
                current_columns = []
            elif line.startswith('  - '):
                column_info = line.replace('  - ', '').strip()
                current_columns.append(column_info)
        
        if current_table:
            tables_info.append((current_table, current_columns))
        
        # Score tables based on relevance
        table_scores = []
        
        for table_name, columns in tables_info:
            score = 0
            
            # Score based on table name similarity
            table_words = table_name.lower().replace('_', ' ').split('.')[-1].split()
            for word in table_words:
                if word in query_lower:
                    score += 3
            
            # Score based on column relevance
            for column in columns:
                col_name = column.split(':')[0].strip().lower()
                col_type = column.split(':')[1].strip().lower() if ':' in column else ''
                
                # Check if column name appears in query
                if col_name.replace('_', ' ') in query_lower or col_name in query_lower:
                    score += 2
                
                # Bonus for date columns if query seems date-related
                if any(date_word in query_lower for date_word in ['date', 'time', 'year', 'month', 'day', 'сана', 'вақт', 'йил', 'ой', 'кун', 'дата', 'время', 'год', 'месяц', 'день']):
                    if any(re.match(pattern, col_name, re.IGNORECASE) for pattern in self.date_column_patterns):
                        score += 4
                    if 'timestamp' in col_type or 'date' in col_type:
                        score += 3
                
                # Bonus for numeric columns if query asks for counts/calculations
                if any(num_word in query_lower for num_word in ['count', 'sum', 'average', 'total', 'сони', 'жами', 'ўртача', 'количество', 'сумма', 'среднее']):
                    if any(num_type in col_type for num_type in ['integer', 'numeric', 'decimal', 'float', 'money']):
                        score += 2
            
            table_scores.append((table_name, score))
        
        # Sort by score descending
        table_scores.sort(key=lambda x: x[1], reverse=True)
        return table_scores
    
    def _build_enhanced_schema_context(self, natural_query: str, table_schemas: str, detected_lang: str) -> str:
        """Build enhanced schema context focusing on most relevant tables"""
        table_relevance = self._analyze_table_relevance(natural_query, table_schemas)
        
        # Take top 5 most relevant tables
        top_tables = table_relevance[:5]
        
        if detected_lang == 'uzbek':
            context = f"Ma'lumotlar bazasi sxemasi (eng muhim jadvallar birinchi o'rinda):\n\n"
        elif detected_lang == 'russian':
            context = f"Схема базы данных (наиболее релевантные таблицы в начале):\n\n"
        else:
            context = f"Database Schema (most relevant tables first):\n\n"
        
        # Add original schema but reorder by relevance
        lines = table_schemas.split('\n')
        relevant_schema_parts = []
        
        for table_name, score in top_tables:
            if score > 0:  # Only include tables with some relevance
                # Find this table's schema section
                table_section = []
                in_table = False
                
                for line in lines:
                    if f"Table: {table_name}" in line:
                        in_table = True
                        table_section.append(f"{line} (Relevance Score: {score})")
                    elif line.startswith("Table: ") and in_table:
                        break
                    elif in_table:
                        table_section.append(line)
                
                if table_section:
                    relevant_schema_parts.append('\n'.join(table_section))
        
        context += '\n\n'.join(relevant_schema_parts)
        
        # Add relationship hints if multiple tables are relevant
        if len(top_tables) > 1:
            if detected_lang == 'uzbek':
                context += "\n\nEslatma: Agar bir nechta jadval kerak bo'lsa, ularni to'g'ri bog'lash uchun JOIN operatoridan foydalaning."
            elif detected_lang == 'russian':
                context += "\n\nПримечание: Если нужны несколько таблиц, используйте JOIN для правильного связывания."
            else:
                context += "\n\nNote: If multiple tables are needed, use appropriate JOINs to connect them properly."
        
        return context
    
    def _generate_sql_sync(self, natural_query: str, table_schemas: str) -> str:
        """Enhanced synchronous SQL generation"""
        detected_lang = self._detect_language(natural_query)
        enhanced_schema = self._build_enhanced_schema_context(natural_query, table_schemas, detected_lang)
        
        # Build language-appropriate system prompt
        if detected_lang == 'uzbek':
            system_prompt = f"""Siz SQL so'rovlarini yaratishda mutaxassis AI assistantisiz. Tabiiy tildagi so'rovlarni SQL ga o'tkazing.

Ma'lumotlar bazasi sxemasi:
{enhanced_schema}

Qoidalar:
1. Faqat to'g'ri SQL SELECT so'rovlarini yarating
2. Sxemadan to'g'ri jadval va ustun nomlarini ishlating
3. Kerak bo'lganda JOIN operatorlarini qo'llang
4. Filtrlash uchun WHERE shartlarini ishlating
5. Tegishli bo'lganda GROUP BY va ORDER BY ishlatishni unutmang
6. Faqat SQL so'rovini qaytaring, tushuntirishsiz
7. Kerak bo'lsa identifikatorlar uchun qo'sh tirnoq ishlating
8. So'rov PostgreSQL bilan mos kelishini ta'minlang
9. Eng mos keladigan jadvallarni birinchi navbatda ko'rib chiqing
"""
        elif detected_lang == 'russian':
            system_prompt = f"""Вы эксперт по генерации SQL запросов. Преобразуйте запросы на естественном языке в SQL.

Схема базы данных:
{enhanced_schema}

Правила:
1. Генерируйте только валидные SQL SELECT запросы
2. Используйте правильные имена таблиц и столбцов из схемы
3. Включайте соответствующие JOIN при необходимости
4. Используйте соответствующие WHERE условия для фильтрации
5. Включайте GROUP BY и ORDER BY когда релевантно
6. Возвращайте только SQL запрос, без объяснений
7. Используйте двойные кавычки для идентификаторов при необходимости
8. Убедитесь, что запрос совместим с PostgreSQL
9. Рассматривайте наиболее релевантные таблицы в первую очередь
"""
        else:
            system_prompt = f"""You are an expert SQL generator. Convert natural language queries to SQL.

Database Schema:
{enhanced_schema}

Rules:
1. Generate only valid SQL SELECT statements
2. Use proper table and column names from the schema
3. Include appropriate JOINs when needed
4. Use appropriate WHERE clauses for filtering
5. Include GROUP BY and ORDER BY when relevant
6. Return only the SQL query, no explanations
7. Use double quotes for identifiers if needed
8. Ensure the query is PostgreSQL compatible
9. Consider the most relevant tables first
"""
        
        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": natural_query}
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
        """Enhanced synchronous insights generation with language detection"""
        if not data:
            detected_lang = self._detect_language(query)
            if detected_lang == 'uzbek':
                return "So'rov natijasida ma'lumot topilmadi."
            elif detected_lang == 'russian':
                return "Запрос не вернул данных."
            else:
                return "No data returned from the query."
        
        detected_lang = self._detect_language(query)
        serialized_data = serialize_for_json(data)
        
        # Always use the standard insights format regardless of data size
        data_summary = f"Query: {query}\n\nResults ({len(serialized_data)} rows):\n"
        for i, row in enumerate(serialized_data[:5]):
            data_summary += f"Row {i+1}: {row}\n"
        
        if len(serialized_data) > 5:
            data_summary += f"... and {len(serialized_data) - 5} more rows\n"
        
        # Language-appropriate system prompt
        if detected_lang == 'uzbek':
            system_prompt = """Siz ma'lumotlarni tahlil qiluvchi AI assistantisiz. So'rov natijalarini tahlil qilib, foydali kuzatishlar bering.

Quyidagilarni taqdim eting:
1. Asosiy topilmalar va tendentsiyalar
2. E'tiborga molik naqshlar yoki anomaliyalar
3. Agar tegishli bo'lsa, biznes uchun muhim xulosalar
4. Ma'lumotlarga asoslangan tavsiyalar

Javobingizni qisqa va ma'lumotli qiling (maksimal 2-3 jumla)."""
        elif detected_lang == 'russian':
            system_prompt = """Вы аналитик данных AI. Проанализируйте результаты запроса и предоставьте полезные наблюдения.

Предоставьте:
1. Ключевые находки и тренды
2. Заметные паттерны или аномалии
3. Бизнес-инсайты, если применимо
4. Рекомендации на основе данных

Делайте ответ кратким но информативным (максимум 2-3 предложения)."""
        else:
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
            if detected_lang == 'uzbek':
                return f"Tahlil yaratishda xatolik: {str(e)}"
            elif detected_lang == 'russian':
                return f"Не удалось создать анализ: {str(e)}"
            else:
                return f"Unable to generate insights: {str(e)}"
    
    async def generate_insights(self, query: str, data: List[Dict[str, Any]], *args) -> str:
        """Async wrapper for insights generation - handles backward compatibility"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor, 
            self._generate_insights_sync, 
            query, 
            data
        )
        
    async def generate_chart_config(self, data: List[Dict[str, Any]], query: str) -> Dict[str, Any]:
        """Generate chart configuration with better detection and language support"""
        detected_lang = self._detect_language(query)
        
        # Check if data is empty
        if not data:
            if detected_lang == 'uzbek':
                return {"no_chart": True, "message": "Ma'lumot topilmadi", "reason": "empty_data"}
            elif detected_lang == 'russian':
                return {"no_chart": True, "message": "Данные не найдены", "reason": "empty_data"}
            else:
                return {"no_chart": True, "message": "No data found", "reason": "empty_data"}
        
        serialized_data = serialize_for_json(data)
        
        # Check if data is too small for meaningful chart
        if len(serialized_data) < 2:
            # Create summary view instead of chart
            summary = self._create_summary_view(data, query, detected_lang)
            summary.update({
                "no_chart": True,
                "reason": "insufficient_data",
                "data_count": len(serialized_data)
            })
            if detected_lang == 'uzbek':
                summary["message"] = "Grafik uchun ma'lumot yetarli emas"
            elif detected_lang == 'russian':
                summary["message"] = "Недостаточно данных для графика"
            else:
                summary["message"] = "Insufficient data for chart"
            return summary
        
        columns = list(serialized_data[0].keys())
        
        # Check if we have enough columns for a meaningful chart
        if len(columns) < 2:
            if detected_lang == 'uzbek':
                return {"no_chart": True, "message": "Ustunlar yetarli emas", "reason": "insufficient_columns"}
            elif detected_lang == 'russian':
                return {"no_chart": True, "message": "Недостаточно столбцов", "reason": "insufficient_columns"}
            else:
                return {"no_chart": True, "message": "Insufficient columns", "reason": "insufficient_columns"}
        
        print(f"Generating chart for {len(serialized_data)} records with columns: {columns}")
        
        # Check if second column has meaningful data for charting
        if len(columns) >= 2:
            second_col_values = [row[columns[1]] for row in serialized_data]
            
            # Check if all values are None or empty
            non_empty_values = [val for val in second_col_values if val is not None and val != '']
            if len(non_empty_values) == 0:
                if detected_lang == 'uzbek':
                    return {"no_chart": True, "message": "Ma'lumot bo'sh", "reason": "empty_values"}
                elif detected_lang == 'russian':
                    return {"no_chart": True, "message": "Пустые данные", "reason": "empty_values"}
                else:
                    return {"no_chart": True, "message": "Empty data", "reason": "empty_values"}
            
            # Check if we have only one unique value (not meaningful for chart)
            unique_values = list(set(str(val) for val in non_empty_values))
            if len(unique_values) == 1:
                if detected_lang == 'uzbek':
                    return {"no_chart": True, "message": "Bir xil qiymatlar", "reason": "uniform_values", "value": unique_values[0]}
                elif detected_lang == 'russian':
                    return {"no_chart": True, "message": "Одинаковые значения", "reason": "uniform_values", "value": unique_values[0]}
                else:
                    return {"no_chart": True, "message": "Identical values", "reason": "uniform_values", "value": unique_values[0]}
        
        # Analyze data to determine best chart type
        chart_type = "bar"  # default
        
        if len(columns) >= 2:
            first_col_values = [row[columns[0]] for row in serialized_data]
            second_col_values = [row[columns[1]] for row in serialized_data]
            
            # Check if second column is numeric
            is_numeric = all(isinstance(val, (int, float)) or (isinstance(val, str) and val.replace('.', '').replace('-', '').isdigit()) for val in second_col_values)
            
            print(f"Second column numeric: {is_numeric}")
            print(f"Data length: {len(serialized_data)}")
            
            # Convert numeric strings to numbers
            if is_numeric:
                second_col_values = [float(val) if isinstance(val, str) else val for val in second_col_values]
            
            # Determine chart type based on data characteristics and language patterns
            date_keywords = ['date', 'time', 'month', 'year', 'day', 'сана', 'вақт', 'ой', 'йил', 'кун', 'дата', 'время', 'месяц', 'год', 'день']
            
            if (len(serialized_data) <= 8 and 
                is_numeric and 
                all(val >= 0 for val in second_col_values) and
                not any(keyword in columns[0].lower() for keyword in date_keywords)):
                chart_type = "pie"
            elif any(keyword in columns[0].lower() for keyword in date_keywords):
                chart_type = "line"
            else:
                chart_type = "bar"
        
        print(f"Selected chart type: {chart_type}")
        
        # Generate language-appropriate titles and labels
        if detected_lang == 'uzbek':
            title_template = f"{columns[1]} bo'yicha {columns[0]}" if len(columns) >= 2 else "Ma'lumotlar diagrammasi"
            over_word = "ustida"
            by_word = "bo'yicha"
        elif detected_lang == 'russian':
            title_template = f"{columns[1]} по {columns[0]}" if len(columns) >= 2 else "Диаграмма данных"
            over_word = "по времени"
            by_word = "по"
        else:
            title_template = f"{columns[1]} by {columns[0]}" if len(columns) >= 2 else "Data Chart"
            over_word = "over"
            by_word = "by"
        
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
                        "text": title_template,
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
                        "text": f"{columns[1]} {over_word} {columns[0]}",
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
                            "text": title_template,
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
                            "text": title_template,
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
    
    def _create_summary_view(self, data: List[Dict[str, Any]], query: str, detected_lang: str) -> Dict[str, Any]:
        """Create a summary view for single results or non-chartable data"""
        if not data:
            return {}
        
        serialized_data = serialize_for_json(data)
        
        # For single result, create a formatted summary
        if len(serialized_data) == 1:
            result = serialized_data[0]
            
            if detected_lang == 'uzbek':
                summary = {
                    "type": "single_result",
                    "title": "Natija",
                    "data": result,
                    "message": "Bitta natija topildi"
                }
            elif detected_lang == 'russian':
                summary = {
                    "type": "single_result", 
                    "title": "Результат",
                    "data": result,
                    "message": "Найден один результат"
                }
            else:
                summary = {
                    "type": "single_result",
                    "title": "Result", 
                    "data": result,
                    "message": "Single result found"
                }
            
            # If it's a query about "maximum", "minimum", "best", etc., format it specially
            query_lower = query.lower()
            superlative_keywords = {
                'uzbek': ['eng ko\'p', 'eng kam', 'eng yaxshi', 'eng yomon', 'maksimal', 'minimal', 'birinchi'],
                'russian': ['самый большой', 'самый маленький', 'максимальный', 'минимальный', 'наибольший', 'наименьший', 'первый'],
                'english': ['maximum', 'minimum', 'highest', 'lowest', 'best', 'worst', 'top', 'first', 'most', 'least']
            }
            
            is_superlative = any(keyword in query_lower for keyword in superlative_keywords.get(detected_lang, []))
            
            if is_superlative:
                if detected_lang == 'uzbek':
                    summary["title"] = "Eng yaxshi natija"
                    summary["message"] = "So'rov bo'yicha eng mos natija"
                elif detected_lang == 'russian':
                    summary["title"] = "Лучший результат"
                    summary["message"] = "Наиболее подходящий результат по запросу"
                else:
                    summary["title"] = "Best Result"
                    summary["message"] = "Most relevant result for your query"
            
            return summary
        
        # For multiple identical values, show table format
        else:
            if detected_lang == 'uzbek':
                return {
                    "type": "table_view",
                    "title": "Jadval ko'rinishi",
                    "data": serialized_data,
                    "message": "Ma'lumotlar jadval ko'rinishida"
                }
            elif detected_lang == 'russian':
                return {
                    "type": "table_view",
                    "title": "Табличный вид", 
                    "data": serialized_data,
                    "message": "Данные в табличном виде"
                }
            else:
                return {
                    "type": "table_view",
                    "title": "Table View",
                    "data": serialized_data, 
                    "message": "Data in table format"
                }