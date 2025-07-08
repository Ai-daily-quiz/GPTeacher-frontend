import os
import requests
import json
from github import Github

def get_pr_diff():
    """PR의 변경사항을 가져옵니다."""
    github_token = os.environ['GITHUB_TOKEN']
    repo_name = os.environ['GITHUB_REPOSITORY']
    pr_number = os.environ['GITHUB_EVENT_PATH']

    with open(pr_number, 'r') as f:
        event = json.load(f)

    pr_num = event['pull_request']['number']

    g = Github(github_token)
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(pr_num)

    files = pr.get_files()
    diff_content = ""

    for file in files:
        if file.patch:
            diff_content += f"\n--- {file.filename} ---\n"
            diff_content += file.patch

    return diff_content, pr

def review_with_llama3(diff_content):
    """Llama3로 코드를 리뷰합니다."""
    prompt = f"""
    다음 코드 변경사항을 검토해주세요. Flask 애플리케이션에 대한 PR입니다.
    **중요: 모든 답변은 한국어로만 작성해주세요.**

    검토 사항:
    1. 보안 이슈
    2. 성능 문제
    3. 코드 품질
    4. 버그 가능성
    5. 베스트 프랙티스 준수

    변경사항:
    {diff_content}

    리뷰 결과를 다음 형식으로 작성해주세요:
    **중요: 모든 답변은 한국어로만 작성해주세요.**
    **개선 사항과 중요이슈는 제 코드를 인용해서 설명해주세요**
    ## 🔍 코드 리뷰 결과

    ### ✅ 좋은 점
    -
    -

    ### ⚠️ 개선 사항
    -
    -

    ### 🚨 중요 이슈
    -
    -
    """

    response = requests.post(
        'http://localhost:11434/api/generate',
        json={
            'model': 'llama3',
            'prompt': prompt,
            'stream': False
        }
    )

    return response.json()['response']

def main():
    diff_content, pr = get_pr_diff()

    if not diff_content.strip():
        print("변경사항이 없습니다.")
        return

    review_comment = review_with_llama3(diff_content)

    # PR에 코멘트 추가
    pr.create_issue_comment(f"🤖 **AI 코드 리뷰**\n\n{review_comment}")

    print("AI 리뷰가 완료되었습니다!")

if __name__ == "__main__":
    main()