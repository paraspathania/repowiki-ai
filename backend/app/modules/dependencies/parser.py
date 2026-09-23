import re
import json
from dataclasses import dataclass
from typing import List, Optional

try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib
    except ImportError:
        tomllib = None


@dataclass
class ParsedDependency:
    name: str
    version: Optional[str]
    type: str  # "production" | "dev" | "peer" | "transitive"
    language: str
    file_path: str


def parse_requirements_txt(content: str, file_path: str) -> List[ParsedDependency]:
    deps: List[ParsedDependency] = []
    # Match: package_name (optionally with extras [standard]) followed optionally by version specifier (==, >=, <=, ~=, !=, <, >)
    req_pattern = re.compile(r"^([a-zA-Z0-9_\-\.]+)(?:\[[^\]]*\])?\s*(?:([=><~^!]=?|[!]=?)\s*([^\s#;]+))?")
    
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("-"):
            continue
        # Strip inline comments
        if "#" in line:
            line = line.split("#", 1)[0].strip()
        
        match = req_pattern.match(line)
        if match:
            name = match.group(1).strip()
            op = match.group(2) or ""
            ver = match.group(3) or ""
            version_str = f"{op}{ver}".strip() if (op or ver) else None
            
            # Avoid duplicate if already present
            if name and not any(d.name.lower() == name.lower() for d in deps):
                deps.append(ParsedDependency(
                    name=name,
                    version=version_str,
                    type="production",
                    language="Python",
                    file_path=file_path
                ))
    return deps


def parse_package_json(content: str, file_path: str) -> List[ParsedDependency]:
    deps: List[ParsedDependency] = []
    try:
        data = json.loads(content)
    except Exception:
        return deps

    sections = [
        ("dependencies", "production"),
        ("devDependencies", "dev"),
        ("peerDependencies", "peer")
    ]
    
    for section_key, dep_type in sections:
        items = data.get(section_key, {})
        if isinstance(items, dict):
            for name, version in items.items():
                deps.append(ParsedDependency(
                    name=name,
                    version=str(version) if version else None,
                    type=dep_type,
                    language="JavaScript",
                    file_path=file_path
                ))
    return deps


def parse_pyproject_toml(content: str, file_path: str) -> List[ParsedDependency]:
    deps: List[ParsedDependency] = []
    if tomllib:
        try:
            data = tomllib.loads(content)
            # PEP 621: [project.dependencies]
            project_deps = data.get("project", {}).get("dependencies", [])
            if isinstance(project_deps, list):
                for item in project_deps:
                    match = re.match(r"^([a-zA-Z0-9_\-\.]+)\s*(?:([=><~^!]=?|[!]=?)\s*([^\s#;]+))?", str(item))
                    if match:
                        name = match.group(1)
                        op = match.group(2) or ""
                        ver = match.group(3) or ""
                        deps.append(ParsedDependency(
                            name=name,
                            version=f"{op}{ver}".strip() if (op or ver) else None,
                            type="production",
                            language="Python",
                            file_path=file_path
                        ))

            # PEP 621: [project.optional-dependencies]
            optional_deps = data.get("project", {}).get("optional-dependencies", {})
            if isinstance(optional_deps, dict):
                for group, group_deps in optional_deps.items():
                    if isinstance(group_deps, list):
                        for item in group_deps:
                            match = re.match(r"^([a-zA-Z0-9_\-\.]+)\s*(?:([=><~^!]=?|[!]=?)\s*([^\s#;]+))?", str(item))
                            if match:
                                deps.append(ParsedDependency(
                                    name=match.group(1),
                                    version=f"{match.group(2) or ''}{match.group(3) or ''}".strip() or None,
                                    type="dev",
                                    language="Python",
                                    file_path=file_path
                                ))

            # Poetry: [tool.poetry.dependencies]
            poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
            if isinstance(poetry_deps, dict):
                for name, val in poetry_deps.items():
                    if name.lower() == "python":
                        continue
                    version = val if isinstance(val, str) else (val.get("version") if isinstance(val, dict) else None)
                    deps.append(ParsedDependency(
                        name=name,
                        version=str(version) if version else None,
                        type="production",
                        language="Python",
                        file_path=file_path
                    ))

            # Poetry dev dependencies
            poetry_dev = data.get("tool", {}).get("poetry", {}).get("group", {}).get("dev", {}).get("dependencies", {})
            if isinstance(poetry_dev, dict):
                for name, val in poetry_dev.items():
                    version = val if isinstance(val, str) else (val.get("version") if isinstance(val, dict) else None)
                    deps.append(ParsedDependency(
                        name=name,
                        version=str(version) if version else None,
                        type="dev",
                        language="Python",
                        file_path=file_path
                    ))
            return deps
        except Exception:
            pass

    # Regex fallback if tomllib parsing failed
    for line in content.splitlines():
        line = line.strip()
        m = re.match(r'^["\']?([a-zA-Z0-9_\-\.]+)["\']?\s*=\s*["\']([^"\']+)["\']', line)
        if m and m.group(1).lower() not in ("python", "name", "version", "description"):
            deps.append(ParsedDependency(
                name=m.group(1),
                version=m.group(2),
                type="production",
                language="Python",
                file_path=file_path
            ))
    return deps


def parse_pipfile(content: str, file_path: str) -> List[ParsedDependency]:
    deps: List[ParsedDependency] = []
    current_section = None
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            current_section = line.strip("[]").strip().lower()
            continue
        if current_section in ("packages", "dev-packages"):
            m = re.match(r'^([a-zA-Z0-9_\-\.]+)\s*=\s*(.+)$', line)
            if m:
                name = m.group(1).strip()
                val = m.group(2).strip().strip('"\'')
                ver = None if val == "*" else val
                dep_type = "dev" if current_section == "dev-packages" else "production"
                deps.append(ParsedDependency(
                    name=name,
                    version=ver,
                    type=dep_type,
                    language="Python",
                    file_path=file_path
                ))
    return deps


def parse_go_mod(content: str, file_path: str) -> List[ParsedDependency]:
    deps: List[ParsedDependency] = []
    in_require_block = False
    
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("//"):
            continue
        
        if line.startswith("require ("):
            in_require_block = True
            continue
        elif in_require_block:
            if line == ")":
                in_require_block = False
                continue
            parts = line.split()
            if len(parts) >= 2:
                name = parts[0]
                version = parts[1]
                is_indirect = "// indirect" in line
                deps.append(ParsedDependency(
                    name=name,
                    version=version,
                    type="transitive" if is_indirect else "production",
                    language="Go",
                    file_path=file_path
                ))
        elif line.startswith("require "):
            parts = line[len("require "):].strip().split()
            if len(parts) >= 2:
                name = parts[0]
                version = parts[1]
                is_indirect = "// indirect" in line
                deps.append(ParsedDependency(
                    name=name,
                    version=version,
                    type="transitive" if is_indirect else "production",
                    language="Go",
                    file_path=file_path
                ))
    return deps


def parse_dependency_file(file_path: str, content: str) -> List[ParsedDependency]:
    file_name = file_path.replace("\\", "/").split("/")[-1].lower()
    
    if file_name == "requirements.txt" or file_name.endswith(".requirements.txt") or "requirements" in file_name and file_name.endswith(".txt"):
        return parse_requirements_txt(content, file_path)
    elif file_name == "package.json":
        return parse_package_json(content, file_path)
    elif file_name == "pyproject.toml":
        return parse_pyproject_toml(content, file_path)
    elif file_name == "pipfile":
        return parse_pipfile(content, file_path)
    elif file_name == "go.mod":
        return parse_go_mod(content, file_path)
    return []
