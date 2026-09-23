import ast
import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple


@dataclass
class ExtractedColumn:
    name: str
    data_type: str = "string"
    is_primary_key: bool = False
    is_nullable: bool = True
    is_foreign_key: bool = False
    references_table: Optional[str] = None
    references_column: Optional[str] = None


@dataclass
class ExtractedRelationship:
    from_column: str
    to_table: str
    to_column: str
    type: str = "one_to_many"  # "one_to_one" | "one_to_many" | "many_to_many"
    is_ambiguous: bool = False


@dataclass
class ExtractedTable:
    name: str
    source_file: Optional[str] = None
    columns: List[ExtractedColumn] = field(default_factory=list)
    relationships: List[ExtractedRelationship] = field(default_factory=list)


def _to_snake_case(name: str) -> str:
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def extract_sqlalchemy_models(content: str, file_path: str) -> List[ExtractedTable]:
    tables: List[ExtractedTable] = []
    try:
        tree = ast.parse(content)
    except Exception:
        return tables

    for node in tree.body:
        if not isinstance(node, ast.ClassDef):
            continue

        # Check if class inherits from Base, Model, etc. or has __tablename__
        has_base = any(
            (isinstance(b, ast.Name) and b.id in ("Base", "Model", "db", "DeclarativeBase")) or
            (isinstance(b, ast.Attribute) and b.attr in ("Base", "Model"))
            for b in node.bases
        )

        table_name = None
        columns: List[ExtractedColumn] = []
        relationships: List[ExtractedRelationship] = []

        # Look for __tablename__ and columns in class body
        for item in node.body:
            # 1. __tablename__ = "users"
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name) and target.id == "__tablename__":
                        if isinstance(item.value, ast.Constant) and isinstance(item.value.value, str):
                            table_name = item.value.value

            # 2. Check for columns: Column(...) or mapped_column(...)
            target_name = None
            call_node = None
            type_ann = None

            if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                target_name = item.target.id
                if item.value and isinstance(item.value, ast.Call):
                    call_node = item.value
                type_ann = ast.unparse(item.annotation) if hasattr(ast, "unparse") else None

            elif isinstance(item, ast.Assign):
                for tgt in item.targets:
                    if isinstance(tgt, ast.Name):
                        target_name = tgt.id
                        if isinstance(item.value, ast.Call):
                            call_node = item.value

            if target_name and call_node:
                func_name = ""
                if isinstance(call_node.func, ast.Name):
                    func_name = call_node.func.id
                elif isinstance(call_node.func, ast.Attribute):
                    func_name = call_node.func.attr

                if func_name in ("Column", "mapped_column"):
                    is_pk = False
                    is_nullable = True
                    is_fk = False
                    ref_table = None
                    ref_col = None
                    col_type = "string"

                    # Infer type from annotation if mapped_column
                    if type_ann:
                        ann_clean = type_ann.replace("Mapped[", "").rstrip("]")
                        if "int" in ann_clean.lower():
                            col_type = "integer"
                        elif "bool" in ann_clean.lower():
                            col_type = "boolean"
                        elif "uuid" in ann_clean.lower():
                            col_type = "uuid"
                        elif "datetime" in ann_clean.lower():
                            col_type = "datetime"
                        elif "float" in ann_clean.lower():
                            col_type = "float"
                        elif "dict" in ann_clean.lower() or "json" in ann_clean.lower():
                            col_type = "json"
                        else:
                            col_type = "string"

                    # Check args
                    for arg in call_node.args:
                        arg_str = ast.unparse(arg) if hasattr(ast, "unparse") else ""
                        if "ForeignKey" in arg_str:
                            is_fk = True
                            fk_match = re.search(r'ForeignKey\(["\']([^"\']+)["\']', arg_str)
                            if fk_match:
                                parts = fk_match.group(1).split(".")
                                if len(parts) >= 2:
                                    ref_table = parts[0]
                                    ref_col = parts[1]
                                elif len(parts) == 1:
                                    ref_table = parts[0]
                                    ref_col = "id"
                        else:
                            arg_lower = arg_str.lower()
                            if "integer" in arg_lower or "int" in arg_lower:
                                col_type = "integer"
                            elif "string" in arg_lower or "text" in arg_lower or "varchar" in arg_lower:
                                col_type = "string"
                            elif "boolean" in arg_lower:
                                col_type = "boolean"
                            elif "uuid" in arg_lower:
                                col_type = "uuid"
                            elif "datetime" in arg_lower or "timestamp" in arg_lower:
                                col_type = "datetime"

                    # Check kwargs
                    for kw in call_node.keywords:
                        if kw.arg == "primary_key":
                            if isinstance(kw.value, ast.Constant) and kw.value.value is True:
                                is_pk = True
                                is_nullable = False
                        elif kw.arg == "nullable":
                            if isinstance(kw.value, ast.Constant):
                                is_nullable = bool(kw.value.value)

                    columns.append(ExtractedColumn(
                        name=target_name,
                        data_type=col_type,
                        is_primary_key=is_pk,
                        is_nullable=is_nullable,
                        is_foreign_key=is_fk,
                        references_table=ref_table,
                        references_column=ref_col
                    ))

                    if is_fk and ref_table and ref_col:
                        relationships.append(ExtractedRelationship(
                            from_column=target_name,
                            to_table=ref_table,
                            to_column=ref_col,
                            type="one_to_many"
                        ))

                elif func_name == "relationship":
                    # e.g. relationship("User", back_populates="posts")
                    if call_node.args:
                        arg0 = call_node.args[0]
                        if isinstance(arg0, ast.Constant) and isinstance(arg0.value, str):
                            rel_target = arg0.value
                            target_table_inferred = _to_snake_case(rel_target) + "s"
                            relationships.append(ExtractedRelationship(
                                from_column=target_name,
                                to_table=target_table_inferred,
                                to_column="id",
                                type="one_to_many"
                            ))

        if table_name or (has_base and columns):
            final_table_name = table_name or _to_snake_case(node.name)
            tables.append(ExtractedTable(
                name=final_table_name,
                source_file=file_path,
                columns=columns,
                relationships=relationships
            ))

    return tables


def extract_sql_ddl(content: str, file_path: str) -> List[ExtractedTable]:
    tables: List[ExtractedTable] = []
    
    # Matches CREATE TABLE [IF NOT EXISTS] name ( body );
    pattern = re.compile(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([a-zA-Z0-9_]+)["`]?\s*\((.*?)\);', re.IGNORECASE | re.DOTALL)
    
    for match in pattern.finditer(content):
        table_name = match.group(1)
        body = match.group(2)
        columns: List[ExtractedColumn] = []
        relationships: List[ExtractedRelationship] = []

        for line in body.splitlines():
            line = line.strip().rstrip(",")
            if not line or line.startswith("--"):
                continue

            # Check FOREIGN KEY (col) REFERENCES target_table(col)
            fk_match = re.search(r'FOREIGN\s+KEY\s*\((["`]?\w+["`]?)\)\s*REFERENCES\s+([a-zA-Z0-9_]+)\s*\((["`]?\w+["`]?)\)', line, re.IGNORECASE)
            if fk_match:
                from_col = fk_match.group(1).strip('"`')
                to_tbl = fk_match.group(2).strip('"`')
                to_c = fk_match.group(3).strip('"`')
                relationships.append(ExtractedRelationship(
                    from_column=from_col,
                    to_table=to_tbl,
                    to_column=to_c,
                    type="one_to_many"
                ))
                continue

            # Check PRIMARY KEY (col)
            pk_match = re.search(r'PRIMARY\s+KEY\s*\((["`]?\w+["`]?)\)', line, re.IGNORECASE)
            if pk_match:
                pk_col = pk_match.group(1).strip('"`')
                for c in columns:
                    if c.name == pk_col:
                        c.is_primary_key = True
                        c.is_nullable = False
                continue

            # Standard column line: col_name data_type ...
            parts = line.split()
            if len(parts) >= 2:
                col_name = parts[0].strip('"`')
                if col_name.upper() in ("CONSTRAINT", "INDEX", "KEY", "CHECK", "UNIQUE"):
                    continue

                raw_type = parts[1].upper()
                col_type = "string"
                if any(t in raw_type for t in ("INT", "SERIAL")):
                    col_type = "integer"
                elif any(t in raw_type for t in ("CHAR", "TEXT")):
                    col_type = "string"
                elif "BOOL" in raw_type:
                    col_type = "boolean"
                elif "UUID" in raw_type:
                    col_type = "uuid"
                elif any(t in raw_type for t in ("DATE", "TIME")):
                    col_type = "datetime"
                elif any(t in raw_type for t in ("FLOAT", "DECIMAL", "NUMERIC", "DOUBLE")):
                    col_type = "float"

                is_pk = "PRIMARY KEY" in line.upper()
                is_nullable = "NOT NULL" not in line.upper()
                is_fk = False
                ref_tbl = None
                ref_col = None

                ref_inline = re.search(r'REFERENCES\s+([a-zA-Z0-9_]+)\s*\((["`]?\w+["`]?)\)', line, re.IGNORECASE)
                if ref_inline:
                    is_fk = True
                    ref_tbl = ref_inline.group(1).strip('"`')
                    ref_col = ref_inline.group(2).strip('"`')
                    relationships.append(ExtractedRelationship(
                        from_column=col_name,
                        to_table=ref_tbl,
                        to_column=ref_col,
                        type="one_to_many"
                    ))

                columns.append(ExtractedColumn(
                    name=col_name,
                    data_type=col_type,
                    is_primary_key=is_pk,
                    is_nullable=is_nullable,
                    is_foreign_key=is_fk,
                    references_table=ref_tbl,
                    references_column=ref_col
                ))

        if columns:
            tables.append(ExtractedTable(
                name=table_name,
                source_file=file_path,
                columns=columns,
                relationships=relationships
            ))

    return tables


def extract_prisma_models(content: str, file_path: str) -> List[ExtractedTable]:
    tables: List[ExtractedTable] = []
    model_pattern = re.compile(r'model\s+([a-zA-Z0-9_]+)\s*\{(.*?)\}', re.DOTALL)

    for match in model_pattern.finditer(content):
        model_name = match.group(1)
        body = match.group(2)
        columns: List[ExtractedColumn] = []
        relationships: List[ExtractedRelationship] = []

        for line in body.splitlines():
            line = line.strip()
            if not line or line.startswith("//"):
                continue

            parts = line.split()
            if len(parts) >= 2:
                col_name = parts[0]
                type_token = parts[1]
                
                # Check for relations
                if "@relation" in line:
                    rel_match = re.search(r'@relation\(fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\]\)', line)
                    if rel_match:
                        from_fields = rel_match.group(1).strip()
                        to_fields = rel_match.group(2).strip()
                        to_tbl = type_token.rstrip("?").rstrip("[]")
                        relationships.append(ExtractedRelationship(
                            from_column=from_fields,
                            to_table=_to_snake_case(to_tbl) + "s",
                            to_column=to_fields,
                            type="one_to_many"
                        ))
                    continue

                if type_token.endswith("[]"):
                    # Prisma relation array, skip as column
                    continue

                # Normal scalar column
                is_nullable = type_token.endswith("?")
                clean_type = type_token.rstrip("?")
                col_type = "string"
                if clean_type in ("Int", "BigInt"):
                    col_type = "integer"
                elif clean_type in ("Boolean"):
                    col_type = "boolean"
                elif clean_type in ("DateTime"):
                    col_type = "datetime"
                elif clean_type in ("Float", "Decimal"):
                    col_type = "float"
                elif clean_type in ("Json"):
                    col_type = "json"

                is_pk = "@id" in line

                columns.append(ExtractedColumn(
                    name=col_name,
                    data_type=col_type,
                    is_primary_key=is_pk,
                    is_nullable=is_nullable,
                    is_foreign_key=False
                ))

        if columns:
            tables.append(ExtractedTable(
                name=_to_snake_case(model_name),
                source_file=file_path,
                columns=columns,
                relationships=relationships
            ))

    return tables


def extract_database_schema(files: List[Tuple[str, str]]) -> List[ExtractedTable]:
    """
    Extracts database tables, columns, and relationships from a list of (file_path, content) tuples.
    """
    all_tables: List[ExtractedTable] = []
    seen_table_names = set()

    for file_path, content in files:
        f_lower = file_path.lower()
        extracted: List[ExtractedTable] = []

        if f_lower.endswith(".py"):
            extracted = extract_sqlalchemy_models(content, file_path)
        elif f_lower.endswith(".sql"):
            extracted = extract_sql_ddl(content, file_path)
        elif f_lower.endswith(".prisma"):
            extracted = extract_prisma_models(content, file_path)

        for table in extracted:
            if table.name.lower() not in seen_table_names:
                seen_table_names.add(table.name.lower())
                all_tables.append(table)

    return all_tables
