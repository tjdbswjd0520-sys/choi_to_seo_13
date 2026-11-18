// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const container = document.createElement('div');
      container.className = 'identity-view';

      const getModeText = (mode) => {
        if (mode === 'demo') return '예제 자료';
        if (mode === 'disconnected') return '연결 없음';
        if (mode === 'unknown') return '확인 불가';
        return '';
      };

      const getDeviceStatusText = (status) => {
        if (status === 'compliant') return '보안 기준 충족';
        if (status === 'noncompliant') return '보안 기준 미충족';
        return '확인 불가';
      };

      const getSessionStatusText = (status) => {
        if (status === 'active') return '활성';
        if (status === 'expired') return '만료';
        if (status === 'revoked') return '철회됨';
        return '확인 불가';
      };

      const appendModeNotice = (label, resource) => {
        const modeText = getModeText(resource?.mode);
        if (!modeText) return;
        const modeEl = document.createElement('div');
        modeEl.className = 'identity-mode-badge';
        modeEl.textContent = `${label}: ${modeText}`;
        container.appendChild(modeEl);
      };

      const appendMessage = (className, text) => {
        const messageEl = document.createElement('div');
        messageEl.className = className;
        messageEl.textContent = text;
        container.appendChild(messageEl);
      };

      const resourceStateMessage = (resource, label) => {
        if (resource?.status === 'loading') return `${label}: 불러오는 중`;
        if (resource?.status === 'error') {
          const serverMessage = typeof resource.error?.message === 'string' && resource.error.message
            ? resource.error.message
            : '알 수 없는 오류';
          return `${label}: 연결 실패: ${serverMessage}`;
        }
        return null;
      };

      appendModeNotice('사용자·현재 기기·현재 세션', me);
      appendModeNotice('기기 목록', devices);
      appendModeNotice('세션 목록', sessions);

      const meStatusMessage = resourceStateMessage(me, '사용자·현재 기기·현재 세션');
      if (meStatusMessage) {
        appendMessage(me?.status === 'error' ? 'identity-error' : 'identity-loading', meStatusMessage);
      } else if (me?.status === 'ok' && me.data) {
        const { user, device, session } = me.data;

        if (user) {
          const userEl = document.createElement('div');
          userEl.className = 'identity-user';
          const userLabel = user.label || user.id || '확인 불가';
          userEl.textContent = user.id
            ? `사용자: ${userLabel} (ID: ${user.id})`
            : `사용자: ${userLabel}`;
          container.appendChild(userEl);
        } else {
          appendMessage('identity-user', '사용자: 확인 불가');
        }

        if (device) {
          const deviceEl = document.createElement('div');
          const deviceStatus = ['compliant', 'noncompliant', 'unknown'].includes(device.status)
            ? device.status
            : 'unknown';
          deviceEl.className = `identity-device status-${deviceStatus}`;
          const deviceLabel = device.label || device.id || '확인 불가';
          const deviceId = device.id ? ` (ID: ${device.id})` : '';
          deviceEl.textContent = `현재 기기: ${deviceLabel}${deviceId} · ${getDeviceStatusText(device.status)}`;
          container.appendChild(deviceEl);
        } else {
          appendMessage('identity-device', '현재 기기: 확인 불가');
        }

        if (session) {
          const sessionEl = document.createElement('div');
          const sessionStatus = ['active', 'expired', 'revoked', 'unknown'].includes(session.status)
            ? session.status
            : 'unknown';
          sessionEl.className = `identity-session status-${sessionStatus}`;
          const sessionId = session.id ? `${session.id} · ` : '';
          sessionEl.textContent = `현재 세션: ${sessionId}${getSessionStatusText(session.status)}`;
          container.appendChild(sessionEl);
        } else {
          appendMessage('identity-session', '현재 세션: 확인 불가');
        }
      } else {
        appendMessage('identity-unknown', '사용자·현재 기기·현재 세션: 확인 불가');
      }

      const appendCollection = (resource, label, kind, describe) => {
        const stateMessage = resourceStateMessage(resource, label);
        if (stateMessage) {
          appendMessage(resource?.status === 'error' ? `identity-${kind}-error` : `identity-${kind}-loading`, stateMessage);
          return;
        }
        if (resource?.status !== 'ok' || !Array.isArray(resource.data)) {
          appendMessage(`identity-${kind}-unknown`, `${label}: 확인 불가`);
          return;
        }

        const section = document.createElement('div');
        section.className = `identity-${kind}-list`;
        const heading = document.createElement('div');
        heading.textContent = label;
        section.appendChild(heading);

        const list = document.createElement('ul');
        for (const item of resource.data) {
          const listItem = document.createElement('li');
          listItem.textContent = describe(item);
          list.appendChild(listItem);
        }
        if (resource.data.length === 0) {
          const emptyItem = document.createElement('li');
          emptyItem.textContent = '표시할 항목이 없습니다.';
          list.appendChild(emptyItem);
        }
        section.appendChild(list);
        container.appendChild(section);
      };

      appendCollection(devices, '기기 목록', 'devices', (device) => {
        const label = device?.label || device?.id || '확인 불가';
        const id = device?.id ? ` (ID: ${device.id})` : '';
        return `${label}${id} · ${getDeviceStatusText(device?.status)}`;
      });
      appendCollection(sessions, '세션 목록', 'sessions', (session) => {
        const id = session?.id ? `${session.id} · ` : '';
        return `${id}${getSessionStatusText(session?.status)}`;
      });

      return container;
    },
    renderDecision({ status, mode, data, error, appId } = {}) {
      const container = document.createElement('div');
      container.className = 'decision-view';

      const appendMessage = (className, text) => {
        const message = document.createElement('p');
        message.className = className;
        message.textContent = text;
        container.appendChild(message);
      };

      if (status === 'idle') {
        appendMessage('decision-idle', '앱을 골라 접속을 요청하세요.');
        return container;
      }

      if (status === 'loading') {
        appendMessage('decision-loading', '판정 확인 중');
        if (typeof appId === 'string' && appId) appendMessage('decision-app', `선택한 앱 ID: ${appId}`);
        return container;
      }

      if (status === 'error') {
        const errorMessage = typeof error?.message === 'string' && error.message
          ? error.message
          : '오류 내용을 확인할 수 없습니다.';
        if (typeof appId === 'string' && appId) appendMessage('decision-app', `선택한 앱 ID: ${appId}`);
        appendMessage('decision-error', `요청 실패: ${errorMessage}`);
        appendMessage('decision-error-note', '요청 실패는 접근 거부 판정이 아닙니다.');
        return container;
      }

      if (status !== 'ok') {
        appendMessage('decision-unknown', '판정 상태를 확인할 수 없습니다.');
        return container;
      }

      const responseAppId = typeof data?.appId === 'string' && data.appId ? data.appId : null;
      const displayedAppId = responseAppId || (typeof appId === 'string' && appId ? appId : null);
      if (displayedAppId) appendMessage('decision-app', `앱 ID: ${displayedAppId}`);

      const decisionLabels = {
        allow: '접근 허용(allow)',
        deny: '접근 거부(deny)',
        challenge: '추가 확인 필요(challenge)',
        unknown: '확인 불가(unknown)',
      };
      const decision = Object.hasOwn(decisionLabels, data?.decision) ? data.decision : 'unknown';
      appendMessage(`decision-result decision-${decision}`, decisionLabels[decision]);

      if (decision === 'allow') {
        appendMessage('decision-allow-note', '정책상 접근 허용이며 실제 업무 앱 접속 성공을 보장하지 않습니다.');
      }
      if (decision === 'challenge') {
        appendMessage('decision-challenge-note', '이 앱은 추가 인증 또는 확인 절차를 대신 수행하지 않습니다.');
      }

      const reason = typeof data?.reason === 'string' && data.reason
        ? data.reason
        : '확인 불가';
      const checkedAt = typeof data?.checkedAt === 'string' && data.checkedAt
        ? data.checkedAt
        : '확인 불가';
      appendMessage('decision-reason', `판정 이유: ${reason}`);
      appendMessage('decision-checked-at', `판정 시각: ${checkedAt}`);

      return container;
    },
    renderEvents({ status, mode, data, error } = {}) {
      const container = document.createElement('div');
      container.className = 'events-view';

      const appendMessage = (className, text) => {
        const message = document.createElement('p');
        message.className = className;
        message.textContent = text;
        container.appendChild(message);
      };

      if (status === 'loading') {
        appendMessage('events-loading', '기록을 불러오는 중입니다.');
        return container;
      }

      if (status === 'error') {
        const message = typeof error?.message === 'string' && error.message
          ? error.message
          : '오류 내용을 확인할 수 없습니다.';
        if (error?.code === 'CONTRACT_MISMATCH') {
          appendMessage('events-unverified', `확인 불가: ${message}`);
        } else {
          appendMessage('events-error', `기록을 불러오지 못했습니다: ${message}`);
        }
        return container;
      }

      if (status !== 'ok' || !Array.isArray(data)) {
        appendMessage('events-unverified', '기록을 확인할 수 없습니다.');
        return container;
      }

      if (data.length === 0) {
        appendMessage('events-empty', '표시할 기록이 없습니다.');
        return container;
      }

      const kindLabels = {
        access: '접속 기록 (access)',
        xdr: 'XDR 경보 (xdr)',
      };
      const accessLabels = {
        allowed: '허용됨(allowed)',
        denied: '거부됨(denied)',
        unknown: '확인 불가(unknown)',
      };
      const sessionLabels = {
        active: '활성(active)',
        expired: '만료(expired)',
        revoked: '철회됨(revoked)',
        unknown: '확인 불가(unknown)',
      };
      const deviceLabels = {
        compliant: '보안 기준 충족(compliant)',
        noncompliant: '보안 기준 미충족(noncompliant)',
        unknown: '확인 불가(unknown)',
      };
      const describeState = (labels, value) => Object.hasOwn(labels, value)
        ? labels[value]
        : `확인 불가(${typeof value === 'string' && value ? value : 'unknown'})`;
      const describeKind = (kind) => Object.hasOwn(kindLabels, kind)
        ? kindLabels[kind]
        : `확인 불가(${typeof kind === 'string' && kind ? kind : 'unknown'})`;
      const describeApp = (appId) => typeof appId === 'string' && appId
        ? appId
        : '앱을 확인할 수 없음';

      // sort는 복사한 배열에만 수행해 서버에서 받은 data를 변경하지 않는다.
      const sortedEvents = data.slice().sort((left, right) => {
        const leftTime = Date.parse(left?.at);
        const rightTime = Date.parse(right?.at);
        if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) return rightTime - leftTime;
        const leftAt = typeof left?.at === 'string' ? left.at : '';
        const rightAt = typeof right?.at === 'string' ? right.at : '';
        return rightAt.localeCompare(leftAt);
      });

      const filters = { kind: 'all', appId: 'all', access: 'all' };
      let selectedEvent = null;

      const filterSection = document.createElement('div');
      filterSection.className = 'events-filters';

      const makeFilter = (accessibleName, values, describeValue) => {
        const label = document.createElement('label');
        label.textContent = accessibleName;
        const select = document.createElement('select');
        select.setAttribute('aria-label', accessibleName);

        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '전체';
        select.appendChild(allOption);

        for (const value of values) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = describeValue(value);
          select.appendChild(option);
        }

        label.appendChild(select);
        filterSection.appendChild(label);
        return select;
      };

      const distinctValues = (values) => [...new Set(values.filter((value) => typeof value === 'string' && value))];
      const kindFilter = makeFilter('기록 종류', distinctValues(sortedEvents.map((event) => event.kind)), describeKind);
      const appFilter = makeFilter('업무 앱', distinctValues(sortedEvents.map((event) => event.appId)), (appId) => appId);
      const accessFilter = makeFilter('접속 상태', distinctValues(sortedEvents.map((event) => event.state?.access)), (access) => describeState(accessLabels, access));

      const count = document.createElement('p');
      count.className = 'events-count';
      count.setAttribute('role', 'status');
      container.appendChild(filterSection);
      container.appendChild(count);

      const list = document.createElement('ul');
      list.className = 'events-list';
      container.appendChild(list);

      const detail = document.createElement('section');
      detail.className = 'events-detail';
      detail.setAttribute('aria-live', 'polite');
      container.appendChild(detail);

      const appendDetailField = (parent, label, value) => {
        const field = document.createElement('p');
        const labelText = document.createElement('strong');
        labelText.textContent = `${label}: `;
        const valueText = document.createElement('span');
        valueText.textContent = value;
        field.appendChild(labelText);
        field.appendChild(valueText);
        parent.appendChild(field);
      };

      const renderDetail = (event) => {
        detail.replaceChildren();
        if (!event) {
          detail.removeAttribute('data-student-event-detail');
          return;
        }

        detail.setAttribute('data-student-event-detail', event.id);
        const heading = document.createElement('h3');
        heading.textContent = `${event.id} 상세`;
        detail.appendChild(heading);
        appendDetailField(detail, '사건 ID', event.id);
        appendDetailField(detail, '업무 앱', describeApp(event.appId));

        const evidenceHeading = document.createElement('h4');
        evidenceHeading.textContent = '근거';
        detail.appendChild(evidenceHeading);
        const evidenceList = document.createElement('ul');
        for (const item of Array.isArray(event.evidence) ? event.evidence : []) {
          const listItem = document.createElement('li');
          listItem.textContent = `${item.id}: ${item.text}`;
          evidenceList.appendChild(listItem);
        }
        detail.appendChild(evidenceList);

        const rulesHeading = document.createElement('h4');
        rulesHeading.textContent = '규칙';
        detail.appendChild(rulesHeading);
        const rulesList = document.createElement('ul');
        for (const item of Array.isArray(event.rules) ? event.rules : []) {
          const listItem = document.createElement('li');
          listItem.textContent = `${item.id}: ${item.text}`;
          rulesList.appendChild(listItem);
        }
        detail.appendChild(rulesList);

        const stateHeading = document.createElement('h4');
        stateHeading.textContent = '상태';
        detail.appendChild(stateHeading);
        appendDetailField(detail, '접속', describeState(accessLabels, event.state?.access));
        appendDetailField(detail, '세션', describeState(sessionLabels, event.state?.session));
        appendDetailField(detail, '기기', describeState(deviceLabels, event.state?.device));
      };

      const renderRows = () => {
        const visibleEvents = sortedEvents.filter((event) =>
          (filters.kind === 'all' || event.kind === filters.kind)
          && (filters.appId === 'all' || event.appId === filters.appId)
          && (filters.access === 'all' || event.state?.access === filters.access));

        count.textContent = `표시 건수: ${visibleEvents.length}`;
        list.replaceChildren();

        if (visibleEvents.length === 0) {
          const emptyItem = document.createElement('li');
          emptyItem.textContent = '필터 조건에 맞는 기록이 없습니다.';
          list.appendChild(emptyItem);
          selectedEvent = null;
          renderDetail(null);
          return;
        }

        if (selectedEvent && !visibleEvents.some((event) => event.id === selectedEvent.id)) {
          selectedEvent = null;
          renderDetail(null);
        }

        for (const event of visibleEvents) {
          const row = document.createElement('li');
          row.setAttribute('data-student-event-id', event.id);

          const heading = document.createElement('h3');
          heading.textContent = event.id;
          row.appendChild(heading);
          appendDetailField(row, '시각', typeof event.at === 'string' ? event.at : '확인 불가');
          appendDetailField(row, '종류', describeKind(event.kind));
          appendDetailField(row, '업무 앱', describeApp(event.appId));
          appendDetailField(row, '요약', typeof event.summary === 'string' ? event.summary : '확인 불가');

          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = `${event.id} 상세`;
          button.setAttribute('aria-label', `${event.id} 상세`);
          button.addEventListener('click', () => {
            selectedEvent = event;
            renderDetail(event);
          });
          row.appendChild(button);
          list.appendChild(row);
        }
      };

      kindFilter.addEventListener('change', () => {
        filters.kind = kindFilter.value;
        renderRows();
      });
      appFilter.addEventListener('change', () => {
        filters.appId = appFilter.value;
        renderRows();
      });
      accessFilter.addEventListener('change', () => {
        filters.access = accessFilter.value;
        renderRows();
      });

      renderRows();
      return container;
    },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
