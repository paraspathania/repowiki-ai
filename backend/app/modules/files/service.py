import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import uuid

from app.core.config import settings
from app.modules.files.models import RepositoryFile
from app.workers.tasks.clone import get_analysis_workspace

MAX_PREVIEW_FILE_SIZE = 1_500_000  # 1.5 MB


class FilesService:
    @staticmethod
    def build_file_tree(files: List[RepositoryFile]) -> List[Dict[str, Any]]:
        """
        Transforms flat list of RepositoryFile records into a nested directory tree:
        [
          {
            "name": "app",
            "path": "app",
            "type": "folder",
            "children": [
              { "name": "main.py", "path": "app/main.py", "type": "file" }
            ]
          }
        ]
        """
        root_nodes: Dict[str, Any] = {}

        # Helper to get or create folder node
        def get_or_create_dir(path_parts: List[str], current_dict: Dict[str, Any]) -> Dict[str, Any]:
            cur = current_dict
            accum_path = []
            for part in path_parts:
                accum_path.append(part)
                folder_path = "/".join(accum_path)
                if part not in cur:
                    cur[part] = {
                        "name": part,
                        "path": folder_path,
                        "type": "folder",
                        "children": {}
                    }
                cur = cur[part]["children"]
            return cur

        for file_record in sorted(files, key=lambda f: f.path):
            norm_path = file_record.path.strip("/").replace("\\", "/")
            parts = norm_path.split("/")
            
            if len(parts) == 1:
                # Top level file
                file_name = parts[0]
                root_nodes[file_name] = {
                    "name": file_name,
                    "path": norm_path,
                    "type": "file",
                    "language": file_record.language,
                    "size_bytes": file_record.size_bytes,
                    "is_binary": file_record.is_binary,
                }
            else:
                dir_parts = parts[:-1]
                file_name = parts[-1]
                target_dir_children = get_or_create_dir(dir_parts, root_nodes)
                target_dir_children[file_name] = {
                    "name": file_name,
                    "path": norm_path,
                    "type": "file",
                    "language": file_record.language,
                    "size_bytes": file_record.size_bytes,
                    "is_binary": file_record.is_binary,
                }

        def convert_dict_to_list(node_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
            result = []
            # Sort folders first, then files alphabetically
            sorted_keys = sorted(
                node_dict.keys(),
                key=lambda k: (0 if node_dict[k]["type"] == "folder" else 1, k.lower())
            )
            for k in sorted_keys:
                item = node_dict[k]
                if item["type"] == "folder":
                    children_list = convert_dict_to_list(item["children"])
                    result.append({
                        "name": item["name"],
                        "path": item["path"],
                        "type": "folder",
                        "children": children_list,
                    })
                else:
                    result.append({
                        "name": item["name"],
                        "path": item["path"],
                        "type": "file",
                        "language": item.get("language"),
                        "size_bytes": item.get("size_bytes", 0),
                        "is_binary": item.get("is_binary", False),
                    })
            return result

        return convert_dict_to_list(root_nodes)

    @staticmethod
    def read_file_safely(analysis_id: uuid.UUID, relative_path: str) -> Dict[str, Any]:
        """
        Safely reads file content from the cloned workspace directory.
        Guards against directory traversal, binary files, and files exceeding size ceiling.
        """
        clean_rel = relative_path.lstrip("/").replace("\\", "/")
        
        # Path traversal guard
        if ".." in clean_rel.split("/"):
            raise ValueError("Potential path traversal detected.")

        workspace_base = get_analysis_workspace(str(analysis_id))
        target_file = (workspace_base / clean_rel).resolve()

        # Guard: must reside within workspace_base
        if not str(target_file).startswith(str(workspace_base)):
            raise ValueError("Access denied: File outside workspace bounds.")

        if not target_file.exists() or not target_file.is_file():
            raise FileNotFoundError("Requested file does not exist.")

        file_size = target_file.stat().st_size
        if file_size > MAX_PREVIEW_FILE_SIZE:
            return {
                "path": clean_rel,
                "is_binary": False,
                "is_truncated": True,
                "size_bytes": file_size,
                "content": f"// File exceeds maximum preview size limit ({file_size} bytes). Preview truncated."
            }

        # Check binary
        try:
            with open(target_file, "rb") as f:
                header = f.read(1024)
                if b"\x00" in header:
                    return {
                        "path": clean_rel,
                        "is_binary": True,
                        "size_bytes": file_size,
                        "content": None
                    }
        except Exception:
            return {
                "path": clean_rel,
                "is_binary": True,
                "size_bytes": file_size,
                "content": None
            }

        # Read text content
        try:
            with open(target_file, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            return {
                "path": clean_rel,
                "is_binary": False,
                "is_truncated": False,
                "size_bytes": file_size,
                "content": content
            }
        except Exception as e:
            return {
                "path": clean_rel,
                "is_binary": False,
                "is_truncated": False,
                "size_bytes": file_size,
                "content": f"// Error reading file content: {str(e)}"
            }
