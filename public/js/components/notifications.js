// public/js/components/notifications.js - Role-Specific Notifications (Section 27)
let currentNotifFilter = 'ALL';

async function renderNotificationsPage() {
  const notifs = await api.getNotifications();

  return `
    <div class="notifications-page">
      <!-- Header with Primary + Add Button -->
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🔔 Notifications
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Role-targeted automated operational alerts, lot verification updates, and transaction events.
          </p>
        </div>
        <button onclick="openModal('create-notification-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
          + Create Notification
        </button>
      </div>

      <!-- Role-Specific Filter Tabs (Section 27) -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
        <button onclick="filterNotifRole('ALL')" class="btn btn-outline btn-sm notif-tab-btn ${currentNotifFilter === 'ALL' ? 'active' : ''}">
          All Alerts (${notifs.length})
        </button>
        <button onclick="filterNotifRole('Farmer')" class="btn btn-outline btn-sm notif-tab-btn ${currentNotifFilter === 'Farmer' ? 'active' : ''}">
          👨‍🌾 Farmer
        </button>
        <button onclick="filterNotifRole('Seller')" class="btn btn-outline btn-sm notif-tab-btn ${currentNotifFilter === 'Seller' ? 'active' : ''}">
          🏢 Seller
        </button>
        <button onclick="filterNotifRole('Buyer')" class="btn btn-outline btn-sm notif-tab-btn ${currentNotifFilter === 'Buyer' ? 'active' : ''}">
          🏢 Buyer
        </button>
        <button onclick="filterNotifRole('FPO Admin')" class="btn btn-outline btn-sm notif-tab-btn ${currentNotifFilter === 'FPO Admin' ? 'active' : ''}">
          🤝 FPO / SHG
        </button>
        <button onclick="filterNotifRole('Logistics Partner')" class="btn btn-outline btn-sm notif-tab-btn ${currentNotifFilter === 'Logistics Partner' ? 'active' : ''}">
          🚚 Logistics
        </button>
        <button onclick="filterNotifRole('Storage Partner')" class="btn btn-outline btn-sm notif-tab-btn ${currentNotifFilter === 'Storage Partner' ? 'active' : ''}">
          🏭 Storage
        </button>
      </div>

      <!-- Notifications List -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div id="notifications-list-container">
          ${renderNotifsItems(notifs, currentNotifFilter)}
        </div>
      </div>
    </div>
  `;
}

function renderNotifsItems(notifs, filterRole) {
  const filtered = filterRole === 'ALL' ? notifs : notifs.filter(n => n.target_role === filterRole || !n.target_role);

  if (filtered.length === 0) {
    return `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <div style="font-size: 32px; margin-bottom: 8px;">🔔</div>
        <div>No notifications found for ${filterRole}.</div>
      </div>
    `;
  }

  return filtered.map(n => {
    const roleIcon = 
      n.target_role === 'Farmer' ? '👨‍🌾' :
      n.target_role === 'Buyer' ? '🏢' :
      n.target_role === 'Seller' ? '🏷️' :
      n.target_role === 'Logistics Partner' ? '🚚' :
      n.target_role === 'Storage Partner' ? '🏭' : '🤝';

    const priorityBadge = 
      n.priority === 'HIGH' ? '<span class="badge" style="background: #fee2e2; color: #dc2626;">HIGH</span>' :
      n.priority === 'LOW' ? '<span class="badge" style="background: #f1f5f9; color: #64748b;">LOW</span>' :
      '<span class="badge badge-accent">NORMAL</span>';

    return `
      <div style="padding: 18px 24px; border-bottom: 1px solid var(--border); display: flex; gap: 16px; align-items: flex-start; transition: background 0.2s;">
        <div style="width: 42px; height: 42px; border-radius: 50%; background: #f0fdf4; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
          ${roleIcon}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <strong style="font-size: 15px; color: var(--text-primary);">${n.title}</strong>
              <span class="badge badge-verified" style="font-size: 11px;">${n.target_role || 'All'}</span>
              ${priorityBadge}
            </div>
            <span style="font-size: 12px; color: var(--text-muted);">${n.created_at ? n.created_at.split('T')[0] : 'Just now'}</span>
          </div>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
            ${n.message}
          </p>
        </div>
      </div>
    `;
  }).join('');
}

function filterNotifRole(role) {
  currentNotifFilter = role;
  navigateTo('notifications');
}

async function handleCreateNotificationSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('notif-form-title').value;
  const message = document.getElementById('notif-form-message').value;
  const targetRole = document.getElementById('notif-form-role').value;
  const priority = document.getElementById('notif-form-priority').value;

  try {
    await api.createNotification({
      title,
      message,
      target_role: targetRole,
      priority
    });
    closeModal('create-notification-modal');
    showToast('Notification alert broadcasted!', 'success');
    navigateTo('notifications');
  } catch (err) {
    showToast('Failed to create notification: ' + err.message, 'error');
  }
}

window.renderNotificationsPage = renderNotificationsPage;
window.filterNotifRole = filterNotifRole;
window.handleCreateNotificationSubmit = handleCreateNotificationSubmit;
