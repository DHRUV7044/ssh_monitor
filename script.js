document.addEventListener('DOMContentLoaded', () => {
  const countdownEl = document.getElementById('countdown');
  const overallStatusBadge = document.getElementById('overall-status-badge');
  const statusIcon = document.getElementById('status-icon');
  const overallStatusText = document.getElementById('overall-status-text');
  
  const staleWarningBox = document.getElementById('stale-warning-box');
  const staleWarningText = document.getElementById('stale-warning-text');
  const lastUpdateVal = document.getElementById('last-update-val');
  
  const labIndicatorDot = document.getElementById('lab-indicator-dot');
  const labStatusText = document.getElementById('lab-status-text');
  const labIpVal = document.getElementById('lab-ip-val');
  const copyIpBtn = document.getElementById('copy-ip-btn');
  
  const sshIndicatorDot = document.getElementById('ssh-indicator-dot');
  const sshStatusText = document.getElementById('ssh-status-text');
  const sshPortVal = document.getElementById('ssh-port-val');
  
  const networksTableBody = document.getElementById('networks-table-body');
  
  let countdownTimer = 900;
  let countdownInterval = null;

  // Format date to IST (Asia/Kolkata) deterministically: e.g. "24 Aug 2026, 06:15 PM IST"
  function formatIST(isoString) {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "--";
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      
      const parts = formatter.formatToParts(date);
      const partMap = {};
      parts.forEach(p => partMap[p.type] = p.value);
      
      const day = partMap.day;
      const month = partMap.month;
      const year = partMap.year;
      const hour = partMap.hour.padStart(2, '0');
      const minute = partMap.minute.padStart(2, '0');
      const ampm = partMap.dayPeriod.toUpperCase();
      
      return `${day} ${month} ${year}, ${hour}:${minute} ${ampm} IST`;
    } catch (e) {
      console.error("Error formatting IST date:", e);
      return "--";
    }
  }

  // Fetch status and update UI
  async function fetchStatus() {
    // Show spinner active state
    const spinner = document.querySelector('.spinner');
    if (spinner) {
      spinner.style.animation = 'spin 1s linear infinite';
    }

    try {
      // Cache-busting using timestamp
      const response = await fetch(`status.json?t=${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      updateUI(data);
    } catch (error) {
      console.error("Failed to fetch status.json:", error);
      showFetchError(error.message);
    } finally {
      // Restore slow rotation of spinner
      setTimeout(() => {
        if (spinner) {
          spinner.style.animation = 'spin 30s linear infinite';
        }
      }, 500);
    }
  }

  // Show fetch error state
  function showFetchError(message) {
    overallStatusBadge.className = 'status-badge state-offline';
    statusIcon.className = 'fa-solid fa-triangle-exclamation';
    overallStatusText.textContent = 'OFFLINE / UNKNOWN';
    
    staleWarningBox.className = 'stale-warning';
    staleWarningText.textContent = `Error loading monitor status: ${message}. Checking connection...`;
    
    labStatusText.textContent = 'UNKNOWN';
    labIndicatorDot.className = 'indicator-dot';
    labIpVal.textContent = 'UNKNOWN';
    copyIpBtn.disabled = true;
    
    sshStatusText.textContent = 'UNKNOWN';
    sshIndicatorDot.className = 'indicator-dot';
    sshPortVal.textContent = '--';
  }

  // Update DOM elements with data
  function updateUI(data) {
    const lastUpdateStr = data.last_update;
    const lastUpdateDate = new Date(lastUpdateStr);
    const now = new Date();
    
    // Calculate difference in minutes
    const diffMs = now - lastUpdateDate;
    const diffMins = Math.max(0, Math.floor(diffMs / 1000 / 60));
    
    // Determine overall state and display stale warning
    let finalState = data.status || 'not_in_lab';
    
    if (diffMins > 60) {
      finalState = 'stale';
      staleWarningBox.classList.remove('hidden');
      staleWarningText.innerHTML = `<strong>Critical:</strong> Report is extremely stale. Last update was <strong>${diffMins} minutes ago</strong>. The laptop might be powered off or disconnected.`;
      staleWarningBox.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      staleWarningBox.style.background = 'rgba(239, 68, 68, 0.08)';
      staleWarningBox.style.color = '#f87171';
    } else if (diffMins > 30) {
      staleWarningBox.classList.remove('hidden');
      staleWarningText.innerHTML = `<strong>Warning:</strong> Report is slightly stale. Last update was <strong>${diffMins} minutes ago</strong>.`;
      staleWarningBox.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      staleWarningBox.style.background = 'rgba(245, 158, 11, 0.08)';
      staleWarningBox.style.color = '#fbbf24';
    } else {
      staleWarningBox.classList.add('hidden');
    }

    // Set last update time
    lastUpdateVal.textContent = formatIST(lastUpdateStr);

    // Render Overall Status Badge
    overallStatusBadge.className = 'status-badge';
    
    if (finalState === 'lab_connected') {
      overallStatusBadge.classList.add('state-connected');
      statusIcon.className = 'fa-solid fa-square-check';
      overallStatusText.textContent = 'LAB CONNECTED';
    } else if (finalState === 'ssh_unavailable') {
      overallStatusBadge.classList.add('state-ssh-unavailable');
      statusIcon.className = 'fa-solid fa-shield-halved';
      overallStatusText.textContent = 'SSH UNAVAILABLE';
    } else if (finalState === 'not_in_lab') {
      overallStatusBadge.classList.add('state-not-in-lab');
      statusIcon.className = 'fa-solid fa-house-laptop';
      overallStatusText.textContent = 'NOT IN LAB';
    } else if (finalState === 'stale') {
      overallStatusBadge.classList.add('state-stale');
      statusIcon.className = 'fa-solid fa-triangle-exclamation';
      overallStatusText.textContent = 'STALE REPORT';
    } else {
      overallStatusBadge.classList.add('state-loading');
      statusIcon.className = 'fa-solid fa-circle-notch fa-spin';
      overallStatusText.textContent = finalState.toUpperCase();
    }

    // Render Lab Connection Details
    if (data.lab_connected) {
      labStatusText.textContent = 'CONNECTED';
      labIndicatorDot.className = 'indicator-dot active';
      
      if (data.lab_ip) {
        labIpVal.textContent = data.lab_ip;
        copyIpBtn.disabled = false;
        
        // Update copy handler
        copyIpBtn.onclick = () => {
          navigator.clipboard.writeText(data.lab_ip).then(() => {
            const icon = copyIpBtn.querySelector('i');
            icon.className = 'fa-solid fa-check';
            icon.style.color = 'var(--color-connected)';
            setTimeout(() => {
              icon.className = 'fa-regular fa-copy';
              icon.style.color = '';
            }, 2000);
          }).catch(err => {
            console.error('Could not copy text: ', err);
          });
        };
      } else {
        labIpVal.textContent = 'NO IP RETRIEVED';
        copyIpBtn.disabled = true;
      }
    } else {
      labStatusText.textContent = 'NOT CONNECTED';
      labIndicatorDot.className = 'indicator-dot inactive';
      labIpVal.textContent = 'NOT CONNECTED';
      copyIpBtn.disabled = true;
    }

    // Render SSH Service Details
    if (data.ssh && data.ssh.available) {
      sshStatusText.textContent = 'AVAILABLE';
      sshIndicatorDot.className = 'indicator-dot active';
      sshPortVal.textContent = data.ssh.port || '22';
    } else {
      sshStatusText.textContent = 'UNAVAILABLE';
      sshIndicatorDot.className = 'indicator-dot inactive';
      sshPortVal.textContent = (data.ssh && data.ssh.port) ? data.ssh.port : '22';
    }

    // Render Networks Table
    networksTableBody.innerHTML = '';
    const networks = data.networks || [];
    
    if (networks.length === 0) {
      networksTableBody.innerHTML = `
        <tr>
          <td colspan="3" class="empty-table">No active networks reported.</td>
        </tr>
      `;
    } else {
      networks.forEach(net => {
        const tr = document.createElement('tr');
        
        const tdName = document.createElement('td');
        tdName.innerHTML = `<i class="fa-solid fa-network-wired" style="color: var(--text-secondary); margin-right: 0.5rem;"></i> ${net.name || 'Unknown Connection'}`;
        
        const tdIntf = document.createElement('td');
        tdIntf.textContent = net.interface || '--';
        
        const tdIp = document.createElement('td');
        tdIp.textContent = net.ip || 'No IP';
        
        tr.appendChild(tdName);
        tr.appendChild(tdIntf);
        tr.appendChild(tdIp);
        
        networksTableBody.appendChild(tr);
      });
    }
  }

  // Refresh interval countdown
  function startCountdown() {
    clearInterval(countdownInterval);
    countdownTimer = 60;
    countdownEl.textContent = countdownTimer;
    
    countdownInterval = setInterval(() => {
      countdownTimer--;
      if (countdownTimer < 0) {
        countdownTimer = 60;
        fetchStatus();
      }
      countdownEl.textContent = countdownTimer;
    }, 1000);
  }

  // Initial load
  fetchStatus();
  startCountdown();
});
