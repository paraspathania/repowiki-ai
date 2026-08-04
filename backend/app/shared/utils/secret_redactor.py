import re

def redact_secrets(text: str) -> str:
    redacted_text = text

    # key-value secrets
    kv_pattern = r'(?i)(password|secret|api[_-]?key|token)(\s*[:=]\s*["\']?)[a-zA-Z0-9_\-\.\+]{8,}(["\']?)'
    redacted_text = re.sub(kv_pattern, r'\1\2[REDACTED]\3', redacted_text)
    
    # AWS, OpenAI, GitHub, Private keys, JWT
    simple_patterns = [
        r'(AKIA[0-9A-Z]{16})',
        r'(sk-[a-zA-Z0-9]{32,})',
        r'(gh[psuo]_[a-zA-Z0-9]{36})',
        r'-----BEGIN [A-Z ]*PRIVATE KEY-----[a-zA-Z0-9\+/\n\r=]+-----END [A-Z ]*PRIVATE KEY-----',
        r'(eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)'
    ]
    for p in simple_patterns:
        redacted_text = re.sub(p, '[REDACTED]', redacted_text)

    # Connection strings
    conn_patterns = [
        r'(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@)',
        r'(postgres(?:ql)?:\/\/[^:]+:)[^@]+(@)',
        r'(mysql:\/\/[^:]+:)[^@]+(@)'
    ]
    for p in conn_patterns:
        redacted_text = re.sub(p, r'\1[REDACTED]\2', redacted_text, flags=re.IGNORECASE)

    return redacted_text
