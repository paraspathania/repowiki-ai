from app.modules.parser.plugins.python import PythonParserPlugin
from app.modules.symbols.models import SymbolType


def test_python_parser_extracts_functions_and_classes():
    code = """
class UserService:
    def __init__(self):
        pass

    async def get_user(self, user_id: str):
        return {"id": user_id}

def calculate_score(val: int) -> int:
    return val * 2
"""
    plugin = PythonParserPlugin()
    res = plugin.parse(code, "service.py")

    symbol_names = [s.name for s in res.symbols]
    assert "UserService" in symbol_names
    assert "get_user" in symbol_names
    assert "calculate_score" in symbol_names

    class_symbol = next(s for s in res.symbols if s.name == "UserService")
    assert class_symbol.symbol_type == SymbolType.CLASS


def test_python_parser_extracts_fastapi_routes():
    code = """
from fastapi import APIRouter

router = APIRouter()

@router.get("/users/{user_id}")
async def read_user(user_id: str):
    return {"user_id": user_id}

@router.post("/items")
def create_item(item: dict):
    return item
"""
    plugin = PythonParserPlugin()
    res = plugin.parse(code, "router.py")

    assert len(res.apis) == 2
    methods = [api.method for api in res.apis]
    routes = [api.route for api in res.apis]

    assert "GET" in methods
    assert "/users/{user_id}" in routes
    assert "POST" in methods
    assert "/items" in routes
