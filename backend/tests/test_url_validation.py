import pytest
from app.modules.repositories.service import parse_github_url
from app.core.exceptions import InvalidRepositoryURLException


def test_parse_github_url_valid():
    owner, repo = parse_github_url("https://github.com/facebook/react")
    assert owner == "facebook"
    assert repo == "react"

    owner2, repo2 = parse_github_url("https://github.com/vercel/next.js.git")
    assert owner2 == "vercel"
    assert repo2 == "next.js"


def test_parse_github_url_ssrf_protection():
    with pytest.raises(InvalidRepositoryURLException):
        parse_github_url("https://malicious-site.com/owner/repo")

    with pytest.raises(InvalidRepositoryURLException):
        parse_github_url("http://169.254.169.254/latest/meta-data")
