import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import { API_BASE as API } from "../../utils/api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Edit modals
  const [editRequest, setEditRequest] = useState(null);
  const [editVolunteer, setEditVolunteer] = useState(null);

  // Confirm cancel/delete
  const [confirmItem, setConfirmItem] = useState(null);

  const contact = sessionStorage.getItem("userContact");

  const fetchDashboard = useCallback(async () => {
    if (!contact) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/User/dashboard/${encodeURIComponent(contact)}`
      );
      if (!res.ok) throw new Error("Failed to fetch data");
      setData(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [contact]);

  useEffect(() => {
    if (!contact) {
      navigate("/login", { replace: true });
      return;
    }
    fetchDashboard();
  }, [contact, navigate, fetchDashboard]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userContact");
    navigate("/");
  };

  const handleSaveRequest = async () => {
    if (!editRequest) return;
    try {
      const res = await fetch(`${API}/api/Requests/${editRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRequest),
      });
      const body = await res.json();
      if (res.ok) {
        showToast(body.message);
        setEditRequest(null);
        fetchDashboard();
      } else {
        showToast(body.message, "error");
      }
    } catch {
      showToast("Failed to update request.", "error");
    }
  };

  const handleSaveVolunteer = async () => {
    if (!editVolunteer) return;
    try {
      const res = await fetch(`${API}/api/Volunteers/${editVolunteer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editVolunteer),
      });
      const body = await res.json();
      if (res.ok) {
        showToast(body.message);
        setEditVolunteer(null);
        fetchDashboard();
      } else {
        showToast(body.message, "error");
      }
    } catch {
      showToast("Failed to update profile.", "error");
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmItem) return;
    const { type, id } = confirmItem;

    const urlMap = {
      request: `${API}/api/Requests/${id}`,
      volunteer: `${API}/api/Volunteers/${id}`,
      donation: `${API}/api/Donations/${id}`,
    };

    try {
      const res = await fetch(urlMap[type], { method: "DELETE" });
      const body = await res.json();
      if (res.ok) {
        showToast(body.message);
        fetchDashboard();
      } else {
        showToast(body.message, "error");
      }
    } catch {
      showToast("Action failed.", "error");
    } finally {
      setConfirmItem(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    return <span className={`statusBadge status-${s}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading your dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Error loading dashboard.
      </div>
    );
  }

  return (
    <div className="userDashboardPage">
      {toast && (
        <div
          className={`dashToast ${toast.type === "error" ? "dashToastError" : "dashToastSuccess"
            }`}
        >
          {toast.msg}
        </div>
      )}

      {confirmItem && (
        <div className="modalOverlay">
          <div className="confirmModal">
            <h3>⚠️ Confirm Action</h3>
            <p>{confirmItem.label}</p>
            <p style={{ color: "#ef4444", fontSize: "0.85rem" }}>
              This action cannot be undone.
            </p>
            <div className="modalActions">
              <button className="btnCancel" onClick={() => setConfirmItem(null)}>
                Cancel
              </button>
              <button className="btnDelete" onClick={handleConfirmAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {editRequest && (
        <div className="modalOverlay">
          <div className="editModal">
            <h3>✏️ Edit Help Request</h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              Only Pending requests can be edited.
            </p>

            <label className="formLabel">Full Name</label>
            <input
              className="formInput"
              value={editRequest.fullName}
              onChange={(e) =>
                setEditRequest({ ...editRequest, fullName: e.target.value })
              }
            />

            <label className="formLabel">Contact</label>
            <input
              className="formInput"
              value={editRequest.contact}
              onChange={(e) =>
                setEditRequest({ ...editRequest, contact: e.target.value })
              }
            />

            <label className="formLabel">Location</label>
            <input
              className="formInput"
              value={editRequest.location}
              onChange={(e) =>
                setEditRequest({ ...editRequest, location: e.target.value })
              }
            />

            <label className="formLabel">Help Type</label>
            <select
              className="formInput"
              value={editRequest.helpType}
              onChange={(e) =>
                setEditRequest({ ...editRequest, helpType: e.target.value })
              }
            >
              <option value="Food">Food</option>
              <option value="Medicine">Medicine</option>
              <option value="Shelter">Shelter</option>
              <option value="Rescue">Rescue</option>
            </select>

            <label className="formLabel">Note</label>
            <textarea
              className="formInput"
              rows={3}
              value={editRequest.note || ""}
              onChange={(e) =>
                setEditRequest({ ...editRequest, note: e.target.value })
              }
            />

            <label className="checkLabel">
              <input
                type="checkbox"
                checked={editRequest.isUrgent}
                onChange={(e) =>
                  setEditRequest({ ...editRequest, isUrgent: e.target.checked })
                }
              />
              &nbsp;Mark as Urgent
            </label>

            <div className="modalActions">
              <button className="btnCancel" onClick={() => setEditRequest(null)}>
                Cancel
              </button>
              <button className="btnSave" onClick={handleSaveRequest}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {editVolunteer && (
        <div className="modalOverlay">
          <div className="editModal">
            <h3>✏️ Edit Volunteer Profile</h3>

            <label className="formLabel">Full Name</label>
            <input
              className="formInput"
              value={editVolunteer.fullName}
              onChange={(e) =>
                setEditVolunteer({ ...editVolunteer, fullName: e.target.value })
              }
            />

            <label className="formLabel">Contact</label>
            <input
              className="formInput"
              value={editVolunteer.contact}
              onChange={(e) =>
                setEditVolunteer({ ...editVolunteer, contact: e.target.value })
              }
            />

            <label className="formLabel">Roles / Skills</label>
            <input
              className="formInput"
              value={editVolunteer.roles}
              onChange={(e) =>
                setEditVolunteer({ ...editVolunteer, roles: e.target.value })
              }
            />

            <label className="formLabel">Location</label>
            <input
              className="formInput"
              value={editVolunteer.location}
              onChange={(e) =>
                setEditVolunteer({ ...editVolunteer, location: e.target.value })
              }
            />

            <label className="formLabel">Availability</label>
            <select
              className="formInput"
              value={editVolunteer.availability}
              onChange={(e) =>
                setEditVolunteer({
                  ...editVolunteer,
                  availability: e.target.value,
                })
              }
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Weekends">Weekends</option>
            </select>

            <label className="formLabel">Has Vehicle?</label>
            <select
              className="formInput"
              value={editVolunteer.hasVehicle}
              onChange={(e) =>
                setEditVolunteer({
                  ...editVolunteer,
                  hasVehicle: e.target.value,
                })
              }
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            {editVolunteer.hasVehicle === "Yes" && (
              <>
                <label className="formLabel">Vehicle Type</label>
                <input
                  className="formInput"
                  value={editVolunteer.vehicleType || ""}
                  onChange={(e) =>
                    setEditVolunteer({
                      ...editVolunteer,
                      vehicleType: e.target.value,
                    })
                  }
                />
              </>
            )}

            <label className="checkLabel">
              <input
                type="checkbox"
                checked={editVolunteer.instantAvailable}
                onChange={(e) =>
                  setEditVolunteer({
                    ...editVolunteer,
                    instantAvailable: e.target.checked,
                  })
                }
              />
              &nbsp;Instantly Available
            </label>

            <div className="modalActions">
              <button
                className="btnCancel"
                onClick={() => setEditVolunteer(null)}
              >
                Cancel
              </button>
              <button className="btnSave" onClick={handleSaveVolunteer}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="dashboardHeader">
        <div className="welcomeText">
          <h1>My Resilio Profile</h1>
          <p>Contact linked: {contact}</p>
        </div>
        <button className="logoutBtn" onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      <div className="dashboardGrid">
        <section className="dashboardSection">
          <h2 className="sectionTitle">My Help Requests</h2>
          {data.myRequests && data.myRequests.length > 0 ? (
            data.myRequests.map((req) => (
              <div className="dataCard" key={req.id}>
                <div className="dataRow">
                  <span className="dataLabel">Type:</span>
                  <span className="dataValue">{req.helpType}</span>
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Location:</span>
                  <span className="dataValue">{req.location}</span>
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Priority:</span>
                  <span className="dataValue">{req.priority}</span>
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Status:</span>
                  {getStatusBadge(req.status)}
                </div>
                {req.assignedVolunteer && (
                  <div
                    className="dataRow"
                    style={{
                      color: "#16a34a",
                      fontSize: "0.875rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <strong>
                      Volunteer: {req.assignedVolunteer.fullName} (
                      {req.assignedVolunteer.contact})
                    </strong>
                  </div>
                )}

                {req.status === "Pending" && (
                  <div className="cardActions">
                    <button
                      className="btnEdit"
                      onClick={() => setEditRequest({ ...req })}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btnCancelItem"
                      onClick={() =>
                        setConfirmItem({
                          type: "request",
                          id: req.id,
                          label: `Cancel and remove your help request for "${req.helpType}" at ${req.location}?`,
                        })
                      }
                    >
                      ✕ Cancel Request
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="emptyState">You have no active help requests.</div>
          )}
        </section>

        <section className="dashboardSection">
          <h2 className="sectionTitle">Volunteer Profile</h2>
          {data.myVolunteerProfiles && data.myVolunteerProfiles.length > 0 ? (
            data.myVolunteerProfiles.map((vol) => (
              <div className="dataCard" key={vol.id}>
                <div className="dataRow">
                  <span className="dataLabel">Status:</span>
                  {getStatusBadge(vol.status)}
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Skills:</span>
                  <span className="dataValue">{vol.roles}</span>
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Location:</span>
                  <span className="dataValue">{vol.location}</span>
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Availability:</span>
                  <span className="dataValue">{vol.availability}</span>
                </div>

                {vol.assignedRequests && vol.assignedRequests.length > 0 && (
                  <div
                    style={{
                      marginTop: "1rem",
                      borderTop: "1px dashed #cbd5e1",
                      paddingTop: "0.5rem",
                    }}
                  >
                    <strong>My Assignments:</strong>
                    {vol.assignedRequests.map((r) => (
                      <div
                        key={r.id}
                        style={{ fontSize: "0.875rem", margin: "0.25rem 0" }}
                      >
                        Task #{r.id}: {r.helpType} at {r.location}
                      </div>
                    ))}
                  </div>
                )}

                {vol.status !== "Blocked" && (
                  <div className="cardActions">
                    <button
                      className="btnEdit"
                      onClick={() => setEditVolunteer({ ...vol })}
                    >
                      ✏️ Edit Profile
                    </button>
                    {vol.status !== "Busy" && (
                      <button
                        className="btnCancelItem"
                        onClick={() =>
                          setConfirmItem({
                            type: "volunteer",
                            id: vol.id,
                            label: `Withdraw your volunteer registration? Your profile will be permanently removed.`,
                          })
                        }
                      >
                        ✕ Withdraw
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="emptyState">
              You are not registered as a volunteer.
            </div>
          )}
        </section>

        <section className="dashboardSection">
          <h2 className="sectionTitle">My Donations</h2>
          {data.myDonations && data.myDonations.length > 0 ? (
            data.myDonations.map((don) => (
              <div className="dataCard" key={don.id}>
                <div className="dataRow">
                  <span className="dataLabel">Resource:</span>
                  <span className="dataValue">{don.resourceType}</span>
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Quantity:</span>
                  <span className="dataValue">{don.quantity}</span>
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Location:</span>
                  <span className="dataValue">{don.location}</span>
                </div>
                <div className="dataRow">
                  <span className="dataLabel">Status:</span>
                  {getStatusBadge(don.status)}
                </div>

                {don.status === "Pending" && (
                  <div className="cardActions">
                    <button
                      className="btnCancelItem"
                      onClick={() =>
                        setConfirmItem({
                          type: "donation",
                          id: don.id,
                          label: `Cancel your pledge of "${don.quantity} ${don.resourceType}" from ${don.location}?`,
                        })
                      }
                    >
                      ✕ Cancel Pledge
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="emptyState">You have no recorded donations.</div>
          )}
        </section>
      </div>
    </div>
  );
}