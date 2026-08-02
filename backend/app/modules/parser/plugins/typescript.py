import re
from app.modules.parser.abstraction import ParserAdapter, ParserResult, ExtractedSymbol, ExtractedImport, ExtractedAPI
from app.modules.symbols.models import SymbolType


class TypeScriptParserPlugin(ParserAdapter):
    def parse(self, code_content: str, file_path: str) -> ParserResult:
        result = ParserResult()
        lines = code_content.splitlines()

        for idx, line in enumerate(lines, 1):
            # 1. Functions (function foo(), export async function bar())
            func_match = re.search(r"(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(", line)
            if func_match:
                name = func_match.group(1)
                result.symbols.append(
                    ExtractedSymbol(
                        name=name,
                        qualified_name=f"{file_path}:{name}",
                        symbol_type=SymbolType.FUNCTION,
                        start_line=idx,
                        end_line=min(idx + 30, len(lines)),
                        signature=line.strip(),
                    )
                )

            # 2. Arrow Functions / Const functions (const handleClick = () => {})
            arrow_match = re.search(r"(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(.*?\)\s*=>", line)
            if arrow_match:
                name = arrow_match.group(1)
                result.symbols.append(
                    ExtractedSymbol(
                        name=name,
                        qualified_name=f"{file_path}:{name}",
                        symbol_type=SymbolType.FUNCTION,
                        start_line=idx,
                        end_line=min(idx + 25, len(lines)),
                        signature=line.strip(),
                    )
                )

            # 3. Classes
            class_match = re.search(r"(?:export\s+)?class\s+([a-zA-Z0-9_$]+)", line)
            if class_match:
                name = class_match.group(1)
                result.symbols.append(
                    ExtractedSymbol(
                        name=name,
                        qualified_name=f"{file_path}:{name}",
                        symbol_type=SymbolType.CLASS,
                        start_line=idx,
                        end_line=min(idx + 50, len(lines)),
                        signature=line.strip(),
                    )
                )

            # 4. Interfaces
            iface_match = re.search(r"(?:export\s+)?interface\s+([a-zA-Z0-9_$]+)", line)
            if iface_match:
                name = iface_match.group(1)
                result.symbols.append(
                    ExtractedSymbol(
                        name=name,
                        qualified_name=f"{file_path}:{name}",
                        symbol_type=SymbolType.INTERFACE,
                        start_line=idx,
                        end_line=min(idx + 20, len(lines)),
                        signature=line.strip(),
                    )
                )

            # 5. Express API Routes (app.get('/api/users', ...), router.post(...))
            express_match = re.search(r"(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*[\"']([^\"']+)[\"']", line, re.IGNORECASE)
            if express_match:
                method = express_match.group(1).upper()
                route = express_match.group(2)
                result.apis.append(
                    ExtractedAPI(
                        method=method,
                        route=route,
                        handler="anonymous_handler",
                        start_line=idx,
                        end_line=idx + 10,
                        authentication="auth" in line.lower() or "bearer" in line.lower(),
                    )
                )

            # 6. Imports
            import_match = re.search(r"import\s+(?:\{([^}]+)\}|([a-zA-Z0-9_$]+))\s+from\s+[\"']([^\"']+)[\"']", line)
            if import_match:
                specifiers = import_match.group(1) or import_match.group(2) or ""
                module = import_match.group(3)
                names = [s.strip() for s in specifiers.split(",") if s.strip()]
                result.imports.append(
                    ExtractedImport(
                        module=module,
                        imported_names=names,
                        line_number=idx,
                    )
                )

        return result
