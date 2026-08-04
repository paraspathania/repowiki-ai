import hashlib
from dataclasses import dataclass
from typing import List, Optional
import uuid
import re

from app.shared.utils.secret_redactor import redact_secrets


@dataclass
class CodeChunkData:
    repository_id: uuid.UUID
    analysis_id: uuid.UUID
    file_id: Optional[uuid.UUID]
    path: str
    language: str
    symbol_name: Optional[str]
    symbol_type: Optional[str]
    start_line: int
    end_line: int
    content: str
    content_hash: str
    token_count: int

class CodeChunker:
    def __init__(self):
        self.symbol_patterns = [
            r'^def\s+([a-zA-Z_]\w*)',
            r'^class\s+([a-zA-Z_]\w*)',
            r'^function\s+([a-zA-Z_]\w*)',
            r'^const\s+([a-zA-Z_]\w*)\s*=',
            r'^async\s+function\s+([a-zA-Z_]\w*)',
            r'^export\s+function\s+([a-zA-Z_]\w*)',
            r'^export\s+const\s+([a-zA-Z_]\w*)\s*=',
            r'^export\s+default\s+function\s+([a-zA-Z_]\w*)',
            r'^interface\s+([a-zA-Z_]\w*)',
            r'^type\s+([a-zA-Z_]\w*)\s*='
        ]

    def _get_symbol_match(self, line: str):
        line = line.strip()
        for pattern in self.symbol_patterns:
            match = re.search(pattern, line)
            if match:
                symbol_name = match.group(1)
                symbol_type = pattern.split(r'\s+')[0].strip('^')
                if 'class' in pattern:
                    symbol_type = 'class'
                elif 'def' in pattern or 'function' in pattern:
                    symbol_type = 'function'
                elif 'const' in pattern:
                    symbol_type = 'constant'
                elif 'interface' in pattern:
                    symbol_type = 'interface'
                elif 'type' in pattern:
                    symbol_type = 'type'
                return symbol_name, symbol_type
        return None, None

    def chunk_file(
        self,
        path: str,
        content: str,
        language: str,
        repository_id: uuid.UUID,
        analysis_id: uuid.UUID,
        file_id: Optional[uuid.UUID]
    ) -> List[CodeChunkData]:
        
        redacted_content = redact_secrets(content)
        lines = redacted_content.split('\n')
        chunks = []
        
        if language.lower() in ['python', 'typescript', 'javascript', 'js', 'ts', 'py']:
            current_symbol = None
            current_type = None
            start_line = 1
            current_content = []
            
            for i, line in enumerate(lines):
                sym_name, sym_type = self._get_symbol_match(line)
                
                if sym_name:
                    if current_content:
                        self._add_chunks(
                            chunks, current_content, start_line, i,
                            current_symbol, current_type, path, language,
                            repository_id, analysis_id, file_id
                        )
                    current_symbol = sym_name
                    current_type = sym_type
                    start_line = i + 1
                    current_content = [line]
                else:
                    current_content.append(line)
            
            if current_content:
                self._add_chunks(
                    chunks, current_content, start_line, len(lines),
                    current_symbol, current_type, path, language,
                    repository_id, analysis_id, file_id
                )
        else:
            window_size = 60
            overlap = 10
            step = window_size - overlap
            
            for i in range(0, len(lines), step):
                window_lines = lines[i:i+window_size]
                if not window_lines:
                    break
                    
                self._add_chunks(
                    chunks, window_lines, i + 1, i + len(window_lines),
                    None, None, path, language,
                    repository_id, analysis_id, file_id
                )

        return chunks

    def _add_chunks(
        self, chunks_list, lines, start_line, end_line,
        symbol_name, symbol_type, path, language,
        repository_id, analysis_id, file_id
    ):
        text = '\n'.join(lines)
        token_count = len(text.split())
        
        if token_count > 1500 and len(lines) > 20:
            mid = len(lines) // 2
            self._add_chunks(
                chunks_list, lines[:mid], start_line, start_line + mid - 1,
                symbol_name, symbol_type, path, language, repository_id, analysis_id, file_id
            )
            self._add_chunks(
                chunks_list, lines[mid:], start_line + mid, end_line,
                symbol_name, symbol_type, path, language, repository_id, analysis_id, file_id
            )
        else:
            if not text.strip():
                return
                
            content_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
            chunks_list.append(CodeChunkData(
                repository_id=repository_id,
                analysis_id=analysis_id,
                file_id=file_id,
                path=path,
                language=language,
                symbol_name=symbol_name,
                symbol_type=symbol_type,
                start_line=start_line,
                end_line=end_line,
                content=text,
                content_hash=content_hash,
                token_count=token_count
            ))
