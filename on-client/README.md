# 내 보안 Agent 시작 틀 0.2.14

이 보안 Agent는 회사 직원이 자기 로그인 상태, 업무 앱 접속 결과, 최근 접속 기록과 보안 경보를 보는 보안 앱입니다. 13단계부터 22단계까지 이 프로젝트 하나로 화면을 채워 가며 완성합니다. 처음이라면 docs/GETTING_STARTED_STUDENT.md부터 읽습니다. 무엇을 왜 만드는지와 단계별 순서가 그 문서에 있습니다.

이 시작 틀을 받은 것만으로 단계를 통과하지 않습니다. 단계마다 docs/STUDENT_PROMPTS.md의 안내를 수업용 AI에 붙여 넣어 student/extension.mjs를 고치고, 화면에서 확인하고, 커밋한 뒤 ALEPH에 제출합니다. 제출하면 서버가 그 커밋의 코드를 받아 AI가 단계 과제 기준으로 읽고 판정합니다. 코드를 실행해서 판정하지 않습니다.

## 켜기

검수·패키지 설정 기준은 Node.js 24.19.0입니다(`package.json`의 `engines`). 외부 npm 의존성은 없습니다. 이 폴더의 PowerShell에서 아래를 실행하고 PC 브라우저로 http://127.0.0.1:5189 를 엽니다. 자세한 켜기·끄기·다시 켜기는 docs/STUDENT_LAUNCH_GUIDE.md에 있습니다.

    powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1

npm start도 같은 서버를 켭니다. 기본 실행은 실제 회사 시스템(기존 엔진)에 연결되지 않은 상태입니다. npm run demo는 예제 자료로 화면을 보여 줄 뿐이며 실제 연결이나 성취가 아닙니다. npm run check는 student/extension.mjs의 문법만 확인합니다.

## 지킬 것

- 기존 1~3차 프로젝트와 학생 파일은 지우거나 덮어쓰지 않습니다. 새 폴더에서 시작하거나, 이미 하던 프로젝트를 이어 씁니다.
- AI 열쇠·비밀번호·토큰을 코드, 커밋, 캡처, 도움정보에 넣지 않습니다. 주소나 열쇠를 직접 입력하는 칸도 만들지 않습니다.
- .env.example에는 비밀 없는 설정만 있습니다.
- 이번 과정에서는 실제 회사 SDP 서버 접속용 개인 인증서·개인키·접속 토큰을 학생에게 발급하지 않습니다. 앱의 ‘연결 없음’ 및 ‘기존 서버·에이전트의 연결을 확인할 수 없습니다’ 표시는 현재 과정에서 정상이며, 인증서나 설정 파일을 요청하지 않습니다. 13~22단계 판정과 마무리 제출은 이 연결과 무관하게 GitHub 커밋의 코드를 읽어 진행합니다.

## 더 읽을 곳

- 단계별 안내와 AI에 붙여 넣을 문장: docs/STUDENT_PROMPTS.md
- 단계별 확인 항목: docs/CURRICULUM.json, docs/IMPLEMENTATION_CONTRACT.md
- 오류 코드별 해결 및 담당자 문의 기준: docs/CONNECTION_TROUBLESHOOT.md
- 시작 틀 업데이트(내 파일 보존): docs/STARTER_UPDATE.md
- SDP 및 앱 안 AI 연결 문서는 기술 배경 참고용입니다. 이번 과정에서 발급하지 않는 SDP 자격 증명이나 설정을 요청하지 마세요. 앱 안 AI 연결 준비는 별도 운영 절차이며, 앱의 SDP 연결 없음 상태와 혼동하지 않습니다: docs/SDP_HOST_CONNECTION.md, docs/AI_SETUP_GUIDE.md.

지원 환경은 프로젝트 설정에 표시된 Node.js 24.19.0입니다. 다른 환경에서의 동작은 이 README에서 확인했다고 주장하지 않습니다.
