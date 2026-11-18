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

        const unsupportedActions = Array.isArray(event.supportedActions)
          ? event.supportedActions.filter((action) => typeof action === 'string' && action.length > 0)
          : [];
        if (unsupportedActions.length > 0) {
          const actionsHeading = document.createElement('h4');
          actionsHeading.textContent = '미지원 조치';
          detail.appendChild(actionsHeading);
          for (const action of unsupportedActions) {
            const button = document.createElement('button');
            button.type = 'button';
            button.disabled = true;
            button.textContent = `${action} 미지원`;
            detail.appendChild(button);
          }
          appendDetailField(detail, '안내', '아직 지원하지 않는 조치입니다. 조치 실행 연결은 준비 중이며, 어떤 요청도 전송하지 않습니다.');
        }
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
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const container = document.createElement('div');
      container.className = 'status-view';

      const appendElement = (parent, tagName, className, text) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        element.textContent = text;
        parent.appendChild(element);
        return element;
      };
      const safeText = (value, fallback = '확인 불가') =>
        typeof value === 'string' && value.length > 0 ? value : fallback;
      const modeLabel = mode === 'demo'
        ? '예제 자료'
        : mode === 'disconnected'
          ? '연결 없음'
          : mode === 'unknown'
            ? '확인 불가'
            : '';
      if (modeLabel) appendElement(container, 'p', 'status-mode', `자료 모드: ${modeLabel}`);

      const deviceStatusText = (status) => {
        const labels = {
          compliant: '보안 기준 충족',
          noncompliant: '보안 기준 미충족',
          unknown: '확인 불가',
        };
        return `${labels[status] ?? '확인 불가'} (${safeText(status)})`;
      };
      const sessionStatusText = (status) => {
        const labels = {
          active: '활성',
          expired: '만료',
          revoked: '철회됨',
          unknown: '확인 불가',
        };
        return `${labels[status] ?? '확인 불가'} (${safeText(status)})`;
      };
      const appendCollection = (resource, kind, title) => {
        const section = document.createElement('section');
        section.className = `status-${kind}`;
        appendElement(section, 'h3', '', title);

        if (resource?.status === 'loading') {
          appendElement(section, 'p', `status-${kind}-loading`, `${title}을 불러오는 중입니다.`);
          container.appendChild(section);
          return;
        }
        if (resource?.status === 'error') {
          const message = safeText(resource.error?.message, '오류 내용을 확인할 수 없습니다.');
          const errorCode = typeof resource.error?.code === 'string' ? resource.error.code : '';
          const timedOut = /TIMEOUT/i.test(errorCode) || message.includes('시간 초과');
          appendElement(section, 'p', `status-${kind}-error`, `${title}을 불러오지 못했습니다${timedOut ? ' (시간 초과)' : ''}: ${message}`);
          appendElement(section, 'p', 'status-retry-guidance', '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.');
          container.appendChild(section);
          return;
        }
        if (resource?.status !== 'ok' || !Array.isArray(resource.data)) {
          appendElement(section, 'p', `status-${kind}-unknown`, `${title}: 확인 불가`);
          container.appendChild(section);
          return;
        }

        if (resource.data.length === 0) {
          appendElement(section, 'p', `status-${kind}-empty`, kind === 'devices' ? '등록된 기기가 없습니다.' : '현재 연결 없음.');
          container.appendChild(section);
          return;
        }

        const list = document.createElement('ul');
        for (const item of resource.data) {
          const label = kind === 'devices'
            ? `기기: ${safeText(item?.label, safeText(item?.id))} · 상태: ${deviceStatusText(item?.status)}`
            : `세션 ID: ${safeText(item?.id)} · 상태: ${sessionStatusText(item?.status)}`;
          appendElement(list, 'li', '', label);
        }
        section.appendChild(list);
        container.appendChild(section);
      };

      appendCollection(devices, 'devices', '기기');
      appendCollection(sessions, 'sessions', '세션');
      appendElement(container, 'p', 'status-session-scope', '세션은 현재 검증된 연결 하나만 표시합니다. 과거 세션 목록이 아닙니다.');

      const notificationsSection = document.createElement('section');
      notificationsSection.className = 'status-notifications';
      appendElement(notificationsSection, 'h3', '', '알림');
      if (!Array.isArray(notifications)) {
        appendElement(notificationsSection, 'p', 'notifications-unknown', '알림 정보를 확인할 수 없습니다.');
      } else if (notifications.length === 0) {
        appendElement(notificationsSection, 'p', 'notifications-empty', '주의할 알림이 없습니다.');
      } else {
        const list = document.createElement('ul');
        for (const notification of notifications) {
          const item = document.createElement('li');
          appendElement(item, 'span', 'notification-resource', `자료: ${safeText(notification?.resource)}`);
          appendElement(item, 'span', 'notification-code', `코드: ${safeText(notification?.code)}`);
          appendElement(item, 'span', 'notification-message', `메시지: ${safeText(notification?.message, '메시지가 없습니다.')}`);
          list.appendChild(item);
        }
        notificationsSection.appendChild(list);
      }
      container.appendChild(notificationsSection);

      const diagnosticsSection = document.createElement('section');
      diagnosticsSection.className = 'status-diagnostics';
      appendElement(diagnosticsSection, 'h3', '', '진단 정보');
      let safeDiagnostics = null;
      if (diagnostics?.status === 'loading') {
        appendElement(diagnosticsSection, 'p', 'diagnostics-loading', '진단 정보를 불러오는 중입니다.');
      } else if (diagnostics?.status === 'error') {
        appendElement(diagnosticsSection, 'p', 'diagnostics-error', `진단 정보를 불러오지 못했습니다: ${safeText(diagnostics.error?.message, '오류 내용을 확인할 수 없습니다.')}`);
      } else if (diagnostics?.status === 'ok' && diagnostics.data && typeof diagnostics.data === 'object') {
        const data = diagnostics.data;
        const engine = data.engine && typeof data.engine === 'object' ? data.engine : {};
        safeDiagnostics = {
          requestId: safeText(data.requestId),
          component: safeText(data.component),
          version: safeText(data.version),
          checkedAt: safeText(data.checkedAt),
          engine: {
            mode: safeText(engine.mode),
            code: safeText(engine.code),
          },
        };
        appendElement(diagnosticsSection, 'p', '', `requestId: ${safeDiagnostics.requestId}`);
        appendElement(diagnosticsSection, 'p', '', `component: ${safeDiagnostics.component}`);
        appendElement(diagnosticsSection, 'p', '', `version: ${safeDiagnostics.version}`);
        appendElement(diagnosticsSection, 'p', '', `checkedAt: ${safeDiagnostics.checkedAt}`);
        appendElement(diagnosticsSection, 'p', '', `engine.mode: ${safeDiagnostics.engine.mode}`);
        appendElement(diagnosticsSection, 'p', '', `engine.code: ${safeDiagnostics.engine.code}`);
      } else {
        appendElement(diagnosticsSection, 'p', 'diagnostics-unknown', '진단 정보를 확인할 수 없습니다.');
      }

      appendElement(diagnosticsSection, 'p', 'diagnostics-copy-help', '도움 요청에 사용할 수 있도록 진단 정보를 복사합니다. 비밀 정보는 복사하지 않습니다.');
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.textContent = '도움정보 복사';
      copyButton.disabled = safeDiagnostics === null;
      const copyFeedback = document.createElement('p');
      copyFeedback.className = 'diagnostics-copy-feedback';
      copyFeedback.setAttribute('role', 'status');
      copyButton.addEventListener('click', async () => {
        if (!safeDiagnostics) return;
        try {
          const clipboard = globalThis.navigator?.clipboard;
          if (!clipboard || typeof clipboard.writeText !== 'function') throw new Error('CLIPBOARD_UNAVAILABLE');
          await clipboard.writeText(JSON.stringify(safeDiagnostics, null, 2));
          copyFeedback.textContent = '도움 요청에 사용할 진단 정보만 복사했습니다.';
        } catch {
          copyFeedback.textContent = '진단 정보를 복사하지 못했습니다. 브라우저의 복사 권한을 확인하세요.';
        }
      });
      diagnosticsSection.appendChild(copyButton);
      diagnosticsSection.appendChild(copyFeedback);
      container.appendChild(diagnosticsSection);

      return container;
    },
    renderVulnerabilities({ status, mode, data, error } = {}) {
      const container = document.createElement('div');
      container.className = 'vulnerabilities-view';

      const appendMessage = (className, text) => {
        const message = document.createElement('p');
        message.className = className;
        message.textContent = text;
        container.appendChild(message);
        return message;
      };
      const displayValue = (value, fallback = '확인 불가') => {
        if (typeof value === 'string' && value.length > 0) return value;
        if (typeof value === 'number' && Number.isFinite(value)) return String(value);
        return fallback;
      };
      const appendField = (parent, label, value) => {
        const field = document.createElement('p');
        field.className = 'vulnerability-field';
        field.textContent = `${label}: ${value}`;
        parent.appendChild(field);
      };
      const errorMessage = typeof error?.message === 'string' && error.message
        ? error.message
        : '오류 내용을 확인할 수 없습니다.';

      if (status === 'idle') {
        appendMessage('vulnerabilities-idle', '취약점 조회 전입니다.');
        return container;
      }
      if (status === 'loading') {
        appendMessage('vulnerabilities-loading', '설치 패키지의 취약점 정보를 조회 중입니다.');
        return container;
      }
      if (status === 'error') {
        appendMessage('vulnerabilities-error', `조회 실패: ${errorMessage}`);
        return container;
      }
      if (status !== 'ok') {
        appendMessage('vulnerabilities-unknown', '취약점 조회 상태를 확인할 수 없습니다.');
        return container;
      }
      if (!data || typeof data !== 'object') {
        appendMessage('vulnerabilities-unknown', '조회 결과를 확인할 수 없습니다.');
        return container;
      }

      const overallStatusLabels = {
        complete: '모두 조회',
        partial: '일부 조회 실패',
        not_checked: '아직 조회 안 함',
        not_configured: '조회 준비 미완료',
        unverifiable: 'lock 파일 확인 불가',
      };
      const overallStatus = typeof data.status === 'string' && data.status
        ? data.status
        : 'unknown';
      const overallLabel = overallStatusLabels[overallStatus] ?? '확인 불가';
      appendMessage('vulnerabilities-result-status', `전체 조회 상태: ${overallLabel}(${overallStatus})`);
      appendMessage('vulnerabilities-scope', '전체 결과는 package-lock.json과 설치된 node_modules의 메타데이터를 대조한 값입니다.');

      if (overallStatus === 'partial') {
        appendMessage('vulnerabilities-partial-note', '일부 조회 실패입니다. 아래에 표시된 취약점 ID는 이미 확인된 결과이며, 전체 조회 결과는 아닙니다.');
      } else if (overallStatus !== 'complete') {
        appendMessage('vulnerabilities-incomplete-note', '미조회 또는 확인 불가 상태는 취약점이 없다는 뜻이 아닙니다.');
      }

      const metadata = document.createElement('section');
      metadata.className = 'vulnerabilities-lockfile';
      const metadataHeading = document.createElement('h3');
      metadataHeading.textContent = '잠금 파일 조회 정보';
      metadata.appendChild(metadataHeading);
      if (data.lockfileVersion !== undefined && data.lockfileVersion !== null) {
        appendField(metadata, 'lockfileVersion', displayValue(data.lockfileVersion));
      }
      if (data.lockfileHash !== undefined && data.lockfileHash !== null) {
        appendField(metadata, 'lockfileHash', displayValue(data.lockfileHash));
      }
      if (data.checkedAt !== undefined && data.checkedAt !== null) {
        appendField(metadata, 'checkedAt', displayValue(data.checkedAt));
      }
      container.appendChild(metadata);

      const packageStatusLabels = {
        known_vulnerabilities: '알려진 취약점 항목 있음',
        none_found: '알려진 항목 없음(조회 범위)',
        unverifiable: '조회 확인 불가',
      };
      const packages = Array.isArray(data.packages) ? data.packages : null;
      if (!packages) {
        appendMessage('vulnerabilities-packages-unknown', '패키지 조회 결과를 확인할 수 없습니다.');
      } else if (packages.length === 0) {
        if (overallStatus === 'not_configured') {
          appendMessage('vulnerabilities-packages-empty', '프로젝트 조회 설정이 준비되지 않아 조회 대상 패키지가 없습니다.');
        } else if (overallStatus === 'not_checked') {
          appendMessage('vulnerabilities-packages-empty', '아직 조회된 패키지가 없습니다. 이는 취약점이 없다는 뜻이 아닙니다.');
        } else if (overallStatus === 'unverifiable') {
          appendMessage('vulnerabilities-packages-empty', 'lock 파일을 확인할 수 없어 패키지별 조회를 검증하지 못했습니다.');
        } else {
          appendMessage('vulnerabilities-packages-empty', '표시할 패키지 결과가 없습니다.');
        }
      } else {
        const packageList = document.createElement('ul');
        packageList.className = 'vulnerabilities-packages';

        for (const packageResult of packages) {
          const row = document.createElement('li');
          row.className = 'vulnerability-package';
          const packageName = displayValue(packageResult?.name, '');
          const packageVersion = displayValue(packageResult?.version, '');
          row.setAttribute('data-student-package-name', packageName);
          row.setAttribute('data-student-package-version', packageVersion);

          const heading = document.createElement('h3');
          heading.textContent = `${packageName || '패키지 이름 확인 불가'} · 설치 버전: ${packageVersion || '확인 불가'}`;
          row.appendChild(heading);

          const packageStatus = typeof packageResult?.status === 'string' && packageResult.status
            ? packageResult.status
            : 'unknown';
          const vulnerabilities = Array.isArray(packageResult?.vulnerabilities)
            ? packageResult.vulnerabilities
            : [];
          let packageStatusLabel = packageStatusLabels[packageStatus] ?? '확인 불가';
          if (packageStatus === 'unverifiable' && vulnerabilities.length > 0) {
            packageStatusLabel = '일부 확인·전체 조회 확인 불가';
          }
          appendField(row, '상태', `${packageStatusLabel}(${packageStatus})`);
          appendField(row, 'source', displayValue(packageResult?.source));
          appendField(row, 'checkedAt', displayValue(packageResult?.checkedAt));

          const vulnerabilityHeading = document.createElement('h4');
          vulnerabilityHeading.textContent = '취약점';
          row.appendChild(vulnerabilityHeading);
          if (vulnerabilities.length > 0) {
            const vulnerabilityList = document.createElement('ul');
            for (const vulnerability of vulnerabilities) {
              const vulnerabilityItem = document.createElement('li');
              const vulnerabilityId = displayValue(vulnerability?.id);
              const modified = displayValue(vulnerability?.modified);
              vulnerabilityItem.textContent = `ID: ${vulnerabilityId} · 수정 시각(modified): ${modified}`;
              vulnerabilityList.appendChild(vulnerabilityItem);
            }
            row.appendChild(vulnerabilityList);
          } else if (packageStatus === 'none_found') {
            appendMessageOn(row, 'vulnerabilities-none-found', '조회 범위에서 알려진 취약점 항목이 없습니다. 이 결과만으로 패키지나 앱 전체의 안전을 보장하지 않습니다.');
          } else if (packageStatus === 'known_vulnerabilities') {
            appendMessageOn(row, 'vulnerabilities-details-missing', '알려진 취약점 상태이지만 세부 항목을 확인할 수 없습니다.');
          } else {
            appendMessageOn(row, 'vulnerabilities-details-unverified', '취약점 세부 결과를 확인할 수 없습니다. 이는 취약점이 없다는 뜻이 아닙니다.');
          }

          packageList.appendChild(row);
        }
        container.appendChild(packageList);
      }

      appendMessage('vulnerabilities-osv-limit', 'OSV는 알려진 취약점 데이터베이스입니다. 조회 결과가 없더라도 패키지나 앱 전체의 안전을 보장하지 않습니다.');
      return container;

      function appendMessageOn(parent, className, text) {
        const message = document.createElement('p');
        message.className = className;
        message.textContent = text;
        parent.appendChild(message);
        return message;
      }
    },
    renderAiConnection({ status, mode, data, error, checkedAt } = {}) {
      const container = document.createElement('div');
      container.className = 'ai-connection-view';

      const appendMessage = (className, text) => {
        const message = document.createElement('p');
        message.className = className;
        message.textContent = text;
        container.appendChild(message);
      };
      const appendMode = () => {
        const labels = {
          connected: '연결됨',
          demo: '예제 자료(demo) · 실제 연결 아님',
          disconnected: '연결 없음',
          unknown: '연결 상태 확인 불가',
        };
        if (!Object.hasOwn(labels, mode)) return;
        appendMessage('ai-connection-mode', `연결 모드: ${labels[mode]}`);
      };
      const safeCode = (value) => typeof value === 'string'
        && /^[A-Za-z0-9_-]{1,80}$/.test(value)
        && !/(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value)
        ? value
        : 'AI_REQUEST_UNVERIFIED';
      const safeMessage = (value) => {
        if (typeof value !== 'string' || value.length === 0 || value.length > 1000
          || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
          || /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value)) {
          return '안전한 오류 메시지를 확인할 수 없습니다.';
        }
        return value;
      };
      const errorGuidance = (code) => {
        if (/PROVISION|AUTHORIZATION_CHANGED/i.test(code)) return '학생 계정 연결과 앱 권한을 담당자에게 확인해 주세요. 학생 잘못이 아닙니다.';
        if (/AUTH_REQUIRED|AUTHENTICATION|ACCESS_BLOCKED|FORBIDDEN/i.test(code)) return '계정 연결을 다시 확인하고, 앱 권한은 담당자에게 확인해 주세요.';
        if (/COHORT_BUDGET|LIMIT_REACHED|BUDGET_EXHAUSTED/i.test(code)) return '반 사용량 또는 이용 한도입니다. 담당자에게 확인해 주세요.';
        if (/SESSION_CLOSED|OUTSIDE.*HOURS/i.test(code)) return '이용 시간이 아닙니다. 정해진 이용 시간을 확인해 주세요.';
        if (/CANCEL/i.test(code)) return '요청이 취소됐습니다. 이전 점검 결과는 현재 결과가 아닙니다.';
        if (/MODEL_NOT_CONFIGURED|MODEL_LIST_EMPTY|NO_MODEL/i.test(code)) return '사용할 수 있는 모델이 없습니다. 담당자에게 모델 허용 설정을 확인해 주세요.';
        if (/RATE_LIMIT|TIMEOUT|NETWORK|CONNECTION/i.test(code)) return '요청 제한, 시간 초과 또는 네트워크 문제일 수 있습니다. 잠시 뒤 직접 다시 점검해 주세요.';
        return '연결 상태와 앱 권한을 확인할 수 없습니다. 담당자에게 계정 연결과 앱 권한 확인을 요청해 주세요.';
      };

      appendMode();
      if (status === 'idle') {
        appendMessage('ai-connection-idle', 'AI 연결 점검 전입니다. 다시 점검하려면 「현재 API 연결 점검」을 직접 누르세요.');
        return container;
      }
      if (status === 'loading') {
        appendMessage('ai-connection-loading', 'AI 연결 점검 중입니다. 자동 재점검은 하지 않습니다.');
        return container;
      }
      if (status === 'error') {
        const code = safeCode(error?.code);
        appendMessage('ai-connection-error', `AI 연결 점검 실패 (${code}): ${safeMessage(error?.message)}`);
        appendMessage('ai-connection-error-guidance', errorGuidance(code));
        appendMessage('ai-connection-retry', '다시 점검하려면 사용자가 「현재 API 연결 점검」을 직접 누르세요.');
        return container;
      }
      if (status !== 'ok') {
        appendMessage('ai-connection-unknown', 'AI 연결 점검 상태를 확인할 수 없습니다.');
        return container;
      }

      if (data?.audienceAuthorization !== 'test' && data?.audienceAuthorization !== 'verified') {
        appendMessage('ai-connection-unknown', 'AI 연결 점검 결과를 확인할 수 없습니다.');
        return container;
      }
      const authorizationLabel = data.audienceAuthorization === 'test'
        ? '시험 연결 점검(test)'
        : '앱 권한 확인 후 점검(verified)';
      appendMessage('ai-connection-result', authorizationLabel);
      appendMessage('ai-connection-model-count', `모델 수: ${Number.isInteger(data.modelCount) && data.modelCount >= 0 ? data.modelCount : '확인 불가'}`);
      appendMessage('ai-connection-checked-at', `점검 시각: ${typeof checkedAt === 'string' && checkedAt ? checkedAt : '확인 불가'}`);
      appendMessage('ai-connection-explanation-note', '이 점검은 AI 연결과 모델 응답만 확인했습니다. 사건 설명은 아직 실행하지 않았습니다.');
      return container;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      const container = document.createElement('div');
      container.className = 'explanation-view';

      const appendMessage = (className, text) => {
        const message = document.createElement('p');
        message.className = className;
        message.textContent = text;
        container.appendChild(message);
        return message;
      };
      const appendField = (parent, label, value) => {
        const field = document.createElement('p');
        field.className = 'explanation-field';
        field.textContent = `${label}: ${value}`;
        parent.appendChild(field);
      };
      const safeCode = (value) => typeof value === 'string'
        && /^[A-Za-z0-9_-]{1,80}$/.test(value)
        && !/(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value)
        ? value
        : null;
      const safeMessage = (value) => {
        if (typeof value !== 'string' || value.length === 0 || value.length > 1000
          || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
          || /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value)) {
          return '안전한 오류 메시지를 확인할 수 없습니다.';
        }
        return value;
      };
      const appendFailure = (message, code) => {
        appendMessage('explanation-error', message);
        if (code) appendMessage('explanation-error-code', `오류 코드: ${code}`);
      };
      const showReferenceFailure = (message) => {
        appendMessage('explanation-unverified', message);
        const code = safeCode(explanation?.error?.code);
        if (code) appendMessage('explanation-error-code', `오류 코드: ${code}`);
      };

      // 실패는 선택된 기록이 없어도 먼저 보여 준다.
      if (explanation?.status === 'error') {
        const code = safeCode(explanation.error?.code);
        appendFailure(`AI 설명 실패: ${safeMessage(explanation.error?.message)}`, code);
        if (code && /EVIDENCE|INVALID_OUTPUT|CONTRACT_MISMATCH/i.test(code)) {
          appendMessage('explanation-error-reason', '근거 또는 설명 형식을 검증할 수 없어 이 설명을 사용할 수 없습니다.');
        }
        if (explanation.data?.executed === true) {
          appendMessage('explanation-executed-rejected', 'AI가 이미 실행했다고 표시한 설명은 사용할 수 없습니다.');
        }
        appendMessage('explanation-error-note', '보안 기록은 그대로이며, 설명 요청 실패는 과제 실패를 뜻하지 않습니다.');
        return container;
      }

      if (!event) {
        appendMessage('explanation-idle', '보안 기록에서 기록을 먼저 고르세요.');
        return container;
      }

      if (explanation?.status === 'loading') {
        appendMessage('explanation-loading', `사건 ${typeof event.id === 'string' ? event.id : ''}의 AI 설명을 요청 중입니다.`);
        return container;
      }
      if (explanation?.status === 'idle') {
        appendMessage('explanation-idle', '선택한 보안 기록의 AI 설명을 요청하세요.');
        return container;
      }
      if (explanation?.status !== 'ok') {
        appendMessage('explanation-unknown', 'AI 설명 상태를 확인할 수 없습니다. 보안 기록은 그대로입니다.');
        return container;
      }

      const result = explanation.data;
      if (typeof event.id !== 'string' || !event.id
        || !result || typeof result.summary !== 'string' || !result.summary.trim()
        || !Array.isArray(event.evidence) || !Array.isArray(result.evidenceIds)
        || !Array.isArray(event.rules) || !event.state || typeof event.state !== 'object'
        || !Array.isArray(event.supportedActions)) {
        showReferenceFailure('선택한 기록의 근거와 설명 자료를 확인할 수 없어 AI 설명을 표시하지 않습니다.');
        return container;
      }
      if (result.executed === true) {
        appendMessage('explanation-executed-rejected', 'AI가 이미 실행했다고 표시한 설명은 사용할 수 없습니다. 보안 조치는 실행되지 않았다고 확인할 수 없습니다.');
        return container;
      }
      if (result.executed !== false || result.requiresHumanConfirmation !== true) {
        appendMessage('explanation-unverified', '설명의 실행 상태 또는 사람 확인 조건을 검증할 수 없어 표시하지 않습니다.');
        return container;
      }

      const evidenceById = new Map();
      let malformedEvidence = false;
      for (const item of event.evidence) {
        if (!item || typeof item.id !== 'string' || !item.id || typeof item.text !== 'string'
          || evidenceById.has(item.id)) {
          malformedEvidence = true;
          break;
        }
        evidenceById.set(item.id, item.text);
      }
      const citedIds = result.evidenceIds;
      const citedSet = new Set();
      if (!malformedEvidence && citedIds.length > 0) {
        for (const id of citedIds) {
          if (typeof id !== 'string' || !id || citedSet.has(id) || !evidenceById.has(id)) {
            malformedEvidence = true;
            break;
          }
          citedSet.add(id);
        }
      } else {
        malformedEvidence = true;
      }
      if (!malformedEvidence && (citedSet.size !== evidenceById.size
        || [...evidenceById.keys()].some((id) => !citedSet.has(id)))) {
        malformedEvidence = true;
      }
      if (malformedEvidence) {
        showReferenceFailure(citedIds.length === 0
          ? '인용된 근거 ID가 없어 설명을 사용할 수 없습니다. 근거가 부족합니다.'
          : '설명에 포함된 근거 ID를 선택한 기록에서 찾을 수 없습니다. 근거가 맞지 않아 설명을 표시하지 않습니다.');
        return container;
      }

      const rules = event.rules;
      if (rules.some((rule) => !rule || typeof rule.id !== 'string' || !rule.id || typeof rule.text !== 'string')) {
        showReferenceFailure('선택한 기록의 규칙 자료를 확인할 수 없어 설명을 표시하지 않습니다.');
        return container;
      }
      const proposals = result.proposals;
      if (!Array.isArray(proposals)) {
        showReferenceFailure('AI 제안 자료를 확인할 수 없어 설명을 표시하지 않습니다.');
        return container;
      }
      for (const proposal of proposals) {
        if (!proposal || typeof proposal.action !== 'string' || !proposal.action
          || !event.supportedActions.includes(proposal.action)
          || typeof proposal.reason !== 'string' || !proposal.reason.trim()
          || !Array.isArray(proposal.evidenceIds) || proposal.evidenceIds.length === 0
          || proposal.evidenceIds.some((id) => typeof id !== 'string' || !evidenceById.has(id))) {
          showReferenceFailure('AI 제안의 근거 또는 지원 조치를 선택한 기록과 대조할 수 없어 설명을 표시하지 않습니다.');
          return container;
        }
      }

      // 성공 자료를 모두 검증한 뒤에만 성공 표식과 설명 내용을 만든다.
      container.setAttribute('data-student-explanation-event', event.id);
      appendMessage('explanation-event-id', `사건 ID: ${event.id}`);
      appendMessage('explanation-heading', 'AI 설명(참고용)');
      appendMessage('explanation-summary', result.summary);

      const evidenceHeading = document.createElement('h3');
      evidenceHeading.textContent = '인용한 근거';
      container.appendChild(evidenceHeading);
      const evidenceList = document.createElement('ul');
      for (const id of citedIds) {
        const item = document.createElement('li');
        item.textContent = `${id} — ${evidenceById.get(id)}`;
        evidenceList.appendChild(item);
      }
      container.appendChild(evidenceList);

      const rulesHeading = document.createElement('h3');
      rulesHeading.textContent = '관련 규칙';
      container.appendChild(rulesHeading);
      if (rules.length === 0) {
        appendMessage('explanation-no-rules', '기록에 연결된 규칙이 없습니다.');
      } else {
        const rulesList = document.createElement('ul');
        for (const rule of rules) {
          const item = document.createElement('li');
          item.textContent = `${rule.id} — ${rule.text}`;
          rulesList.appendChild(item);
        }
        container.appendChild(rulesList);
      }

      const unknownHeading = document.createElement('h3');
      unknownHeading.textContent = '확인 불가 상태';
      container.appendChild(unknownHeading);
      const unknownStates = [
        ['접속', event.state.access],
        ['세션', event.state.session],
        ['기기', event.state.device],
      ].filter(([, value]) => value === 'unknown');
      if (unknownStates.length === 0) {
        appendMessage('explanation-no-unknown', '없음');
      } else {
        const unknownList = document.createElement('ul');
        for (const [label, value] of unknownStates) {
          const item = document.createElement('li');
          item.textContent = `${label}: 확인 불가(${value})`;
          unknownList.appendChild(item);
        }
        container.appendChild(unknownList);
      }

      const proposalsHeading = document.createElement('h3');
      proposalsHeading.textContent = 'AI 제안(참고용)';
      container.appendChild(proposalsHeading);
      if (proposals.length === 0) {
        appendMessage('explanation-no-proposals', event.supportedActions.length === 0
          ? '연동 시스템이 지원하는 조치가 없어 AI 제안이 없습니다. 현재는 정상입니다.'
          : 'AI가 제안한 조치가 없습니다.');
      } else {
        const proposalsList = document.createElement('ul');
        for (const proposal of proposals) {
          const item = document.createElement('li');
          item.textContent = `${proposal.action}: ${proposal.reason} 사람 확인이 필요하며 아직 실행되지 않았습니다.`;
          proposalsList.appendChild(item);
        }
        container.appendChild(proposalsList);
      }
      appendMessage('explanation-advisory-note', 'AI 설명과 제안은 참고 정보입니다. 설명만으로 보안 조치가 실행되지는 않습니다.');
      return container;
    },
    renderAction({ status, event, actionId, target, receipt, observation, message, confirmationExpiresAt, error } = {}) {
      const container = document.createElement('div');
      container.className = 'action-view';

      const appendMessage = (className, text) => {
        const element = document.createElement('p');
        element.className = className;
        element.textContent = text;
        container.appendChild(element);
        return element;
      };
      const displayValue = (value) => {
        if (typeof value === 'string' && value.length > 0) return value;
        if (typeof value === 'number' && Number.isFinite(value)) return String(value);
        if (typeof value === 'boolean') return String(value);
        return null;
      };
      const appendField = (label, value) => {
        const text = displayValue(value);
        if (text === null) return;
        appendMessage('action-detail', `${label}: ${text}`);
      };
      const safeCode = (value) => {
        if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(value)
          || /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value)) {
          return null;
        }
        return value;
      };
      const safeMessage = (value) => {
        if (typeof value !== 'string' || value.length === 0 || value.length > 1000
          || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
          || /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value)) {
          return '안전한 오류 메시지를 확인할 수 없습니다.';
        }
        return value;
      };

      // data-* 표식은 현재 요청의 식별 정보이며, 효과 성공을 뜻하지 않는다.
      const eventId = displayValue(event?.id);
      const requestId = displayValue(receipt?.requestId);
      if (eventId !== null) container.setAttribute('data-student-action-event', eventId);
      if (requestId !== null) container.setAttribute('data-student-action-request', requestId);

      if (status === 'idle') {
        appendMessage('action-idle', '아직 미실행(idle). 조치 제안은 실제 요청이나 효과를 의미하지 않습니다.');
      } else if (status === 'prepared') {
        appendMessage('action-prepared', '준비됨·미실행(prepared). 사람 확인과 제공 화면의 확인 절차 전에는 조치가 전송되지 않았습니다.');
        appendField('확인 기한', confirmationExpiresAt);
      } else if (status === 'loading') {
        appendMessage('action-loading', '조치 준비 또는 결과 조회 중(loading)입니다. 실제 효과는 아직 확인되지 않았습니다.');
      } else if (status === 'executing') {
        appendMessage('action-executing', '서버에 전달 중(executing)입니다. 결과는 아직 확인되지 않았으며 완료 또는 성공으로 판단할 수 없습니다.');
      } else if (status === 'pending') {
        appendMessage('action-pending', '서버 접수·처리 중(pending)입니다. 서버가 요청을 받았다는 ACK는 조치 효과 확인이 아니며, 결과는 아직 확인되지 않았습니다.');
      } else if (status === 'succeeded' && observation?.effectApplied === true) {
        appendMessage('action-succeeded', '효과 확인(succeeded)');
        appendField('관측 시각', observation.observedAt);
        appendMessage('action-effect-applied', 'effectApplied: true');
        appendField('receiptId', receipt?.receiptId);
      } else if (status === 'succeeded') {
        appendMessage('action-unknown', '결과 불명(unknown)입니다. 효과 확인 조건이 충족되지 않아 성공이나 효과 없음으로 판단하지 않습니다. 제공 화면에서 연동 시스템 결과만 재조회하세요.');
        appendField('전달된 상태', 'succeeded');
        if (observation && Object.hasOwn(observation, 'effectApplied')) {
          appendField('관측값 effectApplied', observation.effectApplied);
        }
      } else if (status === 'denied') {
        appendMessage('action-denied', `연동 시스템 거절(denied): ${safeMessage(message)}`);
      } else if (status === 'failed') {
        appendMessage('action-failed', `연동 시스템 실패(failed): ${safeMessage(message)}`);
      } else if (status === 'unknown') {
        appendMessage('action-unknown', '결과 불명(unknown)입니다. 성공이나 효과 없음으로 판단하지 마세요. 제공 화면의 「연동 시스템 결과만 재조회」를 사용해 결과를 다시 조회하세요.');
      } else if (status === 'expired') {
        appendMessage('action-expired', '확인 기한 지남(expired). 이 확인은 만료되었으므로 제공 화면에서 조치를 다시 준비해야 합니다.');
      } else if (status === 'error') {
        const code = safeCode(error?.code);
        appendMessage('action-error', `요청이 처리되지 않았습니다(error): ${safeMessage(error?.message)}`);
        if (code) appendField('오류 코드', code);
      } else {
        appendMessage('action-unknown', `결과 불명(unknown). 전달된 상태를 확인할 수 없습니다${displayValue(status) === null ? '' : ` (${displayValue(status)})`}. 제공 화면에서 연동 시스템 결과만 재조회하세요.`);
      }

      if (eventId !== null) appendField('사건 ID', eventId);
      const evidence = Array.isArray(event?.evidence) ? event.evidence : null;
      if (evidence !== null) {
        const evidenceIds = evidence
          .map((item) => displayValue(item?.id))
          .filter((id) => id !== null);
        appendField('근거 ID', evidenceIds.length > 0 ? evidenceIds.join(', ') : '없음');
      }
      appendField('actionId', actionId);
      appendField('target.id', target?.id);
      appendField('target.generation', target?.generation);
      appendField('receipt.requestId', receipt?.requestId);
      appendField('receipt.receiptId', receipt?.receiptId);
      appendField('receipt.version', receipt?.version);

      if (event && Array.isArray(event.supportedActions) && event.supportedActions.length === 0) {
        appendMessage('action-unavailable', '현재 기록에는 연동 시스템이 지원하는 조치가 없습니다. 조치 준비 버튼이 표시되지 않는 것이 정상이며, 학생 화면에서 조치를 전송하지 않습니다.');
      }
      appendMessage('action-controls-note', '조치 준비·사람 확인·결과 재조회는 제공 화면의 버튼을 사용하세요. 이 화면은 조치 버튼이나 요청을 만들지 않습니다. 「조치 화면 취소」는 이미 서버에 전달된 조치 효과를 되돌리지 않습니다.');
      return container;
    },
  };
}
