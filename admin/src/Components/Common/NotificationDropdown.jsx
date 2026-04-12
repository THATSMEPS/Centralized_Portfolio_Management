import React, { useState, useEffect } from 'react';
import { Col, Dropdown, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import axios from 'axios';
import { requestPermission, onMessage } from '../../firebase'; // Import from your firebase config
import { toast } from 'react-toastify';
import config from '../../config';

//import images
//import images

//SimpleBar
import SimpleBar from "simplebar-react";

const NotificationDropdown = () => {
    //Dropdown Toggle
    const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState('1');

    const toggleNotificationDropdown = () => {
        setIsNotificationDropdown(!isNotificationDropdown);
    };

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    // 1. Initialize & Fetch
    useEffect(() => {
        const init = async () => {
            // A. Request Perm & Register Token
            const token = await requestPermission();
            if (token) {
                // Register token with backend
                try {
                    // Assuming you have a way to get the auth token (e.g. from localStorage)
                    const authToken = localStorage.getItem("authUser") ? JSON.parse(localStorage.getItem("authUser")).token : null;
                    // Adjust token retrieval logic based on your auth implementation

                    // Or maybe just localStorage.getItem("token") based on user snippet
                    const jwt = localStorage.getItem("token") || (localStorage.getItem("authUser") && JSON.parse(localStorage.getItem("authUser")).token);

                    if (jwt) {
                        await axios.post(`${config.api.API_URL}/api/v1/notifications/register-token`, {
                            fcmToken: token,
                            deviceId: "admin_web_" + Date.now(), // Simple unique ID for browser session
                            platform: "WEB"
                        }, {
                            headers: { Authorization: `Bearer ${jwt}` }
                        });
                        console.log("FCM Token registered");
                    }
                } catch (err) {
                    console.error("Token registration failed", err);
                }
            }

            // B. Fetch Notifications
            fetchNotifications();
        };

        init();

        // C. Listen for foreground messages
        onMessage((payload) => {
            console.log("Foreground notification:", payload);
            toast.info(`New Notification: ${payload.notification.title}`);
            fetchNotifications(); // Refresh list
        });

    }, []);

    const fetchNotifications = async () => {
        try {
            const jwt = localStorage.getItem("token") || (localStorage.getItem("authUser") && JSON.parse(localStorage.getItem("authUser")).token);
            if (!jwt) return;

            const response = await axios.get(`${config.api.API_URL}/api/v1/notifications?limit=20`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });

            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.meta.unreadCount);
            }
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    }

    const markAsRead = async (id, link) => {
        try {
            const jwt = localStorage.getItem("token") || (localStorage.getItem("authUser") && JSON.parse(localStorage.getItem("authUser")).token);
            await axios.put(`${config.api.API_URL}/api/v1/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${jwt}` }
            });

            // Update local state
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Redirect if link exists (if it's an internal link, use history/navigate, else window.location)
            if (link && link !== "#") {
                window.location.href = link;
            }

        } catch (error) {
            console.error("Error marking read", error);
        }
    }

    return (
        <React.Fragment>
            <Dropdown isOpen={isNotificationDropdown} toggle={toggleNotificationDropdown} className="topbar-head-dropdown ms-1 header-item">
                <DropdownToggle type="button" tag="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
                    <i className='bx bx-bell fs-22'></i>
                    {unreadCount > 0 && (
                        <span
                            className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
                            {unreadCount > 99 ? '99+' : unreadCount}
                            <span className="visually-hidden">unread messages</span>
                        </span>
                    )}
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                    <div className="dropdown-head bg-primary bg-pattern rounded-top">
                        <div className="p-3">
                            <Row className="align-items-center">
                                <Col>
                                    <h6 className="m-0 fs-16 fw-semibold text-white"> Notifications </h6>
                                </Col>
                                <div className="col-auto dropdown-tabs">
                                    <span className="badge badge-soft-light fs-13"> {unreadCount} New</span>
                                </div>
                            </Row>
                        </div>

                        <div className="px-2 pt-2">
                            <Nav className="nav-tabs dropdown-tabs nav-tabs-custom">
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({ active: activeTab === '1' })}
                                        onClick={() => { toggleTab('1'); }}
                                    >
                                        All
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </div>

                    </div>

                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1" className="py-2 ps-2">
                            <SimpleBar style={{ maxHeight: "300px" }} className="pe-2">
                                {notifications.length > 0 ? (
                                    notifications.map((item, key) => (
                                        <div key={key} className={`text-reset notification-item d-block dropdown-item position-relative ${!item.isRead ? 'active' : ''}`}
                                            onClick={() => markAsRead(item._id, item.metadata?.redirectUrl)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex">
                                                <div className="avatar-xs me-3">
                                                    <span className={`avatar-title bg-soft-${getBadgeColor(item.type)} text-${getBadgeColor(item.type)} rounded-circle fs-16`}>
                                                        <i className={`bx ${getIcon(item.type)}`}></i>
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <h6 className="mt-0 mb-2 lh-base">
                                                        {item.title}
                                                    </h6>
                                                    <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                        <span className="me-2">{item.message}</span>
                                                        <span><i className="mdi mdi-clock-outline"></i> {new Date(item.createdAt).toLocaleTimeString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="tab-pane p-4">
                                        <div className="w-25 w-sm-50 pt-3 mx-auto text-center">
                                            <i className='bx bx-bell fs-36 text-muted' style={{ fontSize: '3rem' }}></i>
                                        </div>
                                        <div className="text-center pb-5 mt-2">
                                            <h6 className="fs-18 fw-semibold lh-base">Hey! You have no any notifications </h6>
                                        </div>
                                    </div>
                                )}
                            </SimpleBar>
                        </TabPane>
                    </TabContent>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

// Helper for styling
const getBadgeColor = (type) => {
    switch (type) {
        case 'NEW_ORDER': return 'success';
        case 'LOW_STOCK': return 'warning';
        case 'ORDER_STATUS': return 'info';
        default: return 'primary';
    }
};

const getIcon = (type) => {
    switch (type) {
        case 'NEW_ORDER': return 'bx-cart';
        case 'LOW_STOCK': return 'bx-error';
        default: return 'bx-bell';
    }
}

export default NotificationDropdown;