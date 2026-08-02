from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import List, Optional
from app.modules.symbols.models import SymbolType


class ExtractedSymbol(BaseModel):
    name: str
    qualified_name: str
    symbol_type: SymbolType
    start_line: int
    end_line: int
    signature: Optional[str] = None


class ExtractedImport(BaseModel):
    module: str
    imported_names: List[str] = []
    line_number: int


class ExtractedAPI(BaseModel):
    method: str
    route: str
    handler: str
    start_line: int
    end_line: int
    authentication: bool = False


class ParserResult(BaseModel):
    symbols: List[ExtractedSymbol] = []
    imports: List[ExtractedImport] = []
    apis: List[ExtractedAPI] = []


class ParserAdapter(ABC):
    @abstractmethod
    def parse(self, code_content: str, file_path: str) -> ParserResult:
        pass
