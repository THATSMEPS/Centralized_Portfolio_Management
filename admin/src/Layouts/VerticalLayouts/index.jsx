import React, { useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Collapse } from "reactstrap";
import withRouter from "../../Components/Common/withRouter";
import { MenuContext } from "../../context/MenuContext";

const VerticalLayout = (props) => {
    const { menuData, loading, updateCurrentPagePermissions } =
        useContext(MenuContext);
    const [expandedItems, setExpandedItems] = useState({});

    const path = props.router.location.pathname;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (!menuData || !Array.isArray(menuData)) return;

        const currentPath = path;
        const newExpandedItems = {};

        // Recursive helper to find active item and its parents
        const findActivePath = (items, parents = []) => {
            for (const item of items) {
                // Check if this item matches current path
                if (item.url === currentPath) {
                    parents.forEach(pId => newExpandedItems[pId] = true);
                    return true;
                }

                // Recursively check children
                if (item.children && item.children.length > 0) {
                    if (findActivePath(item.children, [...parents, item.id])) {
                        parents.forEach(pId => newExpandedItems[pId] = true);
                        newExpandedItems[item.id] = true;
                        return true;
                    }
                }
            }
            return false;
        };

        // Scan all groups
        menuData.forEach(group => {
            if (group.menus) {
                if (findActivePath(group.menus, [group.groupId])) {
                    newExpandedItems[group.groupId] = true;
                }
            } else if (group.isLink && group.url === currentPath) {
                // Direct link match
            }
        });

        // Update state to expand active path
        setExpandedItems(prev => ({
            ...prev,
            ...newExpandedItems
        }));

    }, [path, menuData, props.layoutType]);

    // Toggle expanded state for any menu item (accordion behavior - only one open at a time per level)
    // siblingIds contains the IDs of all sibling items at the same level
    const toggleItem = (itemId, siblingIds = []) => {
        setExpandedItems((prev) => {
            const isCurrentlyOpen = prev[itemId];

            // If we're opening this item, close all siblings
            if (!isCurrentlyOpen) {
                const newState = { ...prev };
                // Close all sibling items
                siblingIds.forEach((id) => {
                    if (id !== itemId) {
                        newState[id] = false;
                    }
                });
                // Open the clicked item
                newState[itemId] = true;
                return newState;
            } else {
                // If we're closing, just toggle this item
                return {
                    ...prev,
                    [itemId]: false,
                };
            }
        });
    };

    // Helper functions activateParentDropdown and removeActivation removed
    // as we now use React state (expandedItems) to control menu visibility

    // Handle menu item click to update current page permissions
    const handleMenuItemClick = (menuId) => {
        if (menuId) {
            updateCurrentPagePermissions(menuId);
        }
    };

    // Recursive function to render menu items at any nesting level
    // siblingIds contains IDs of all sibling items at this level for accordion behavior
    const renderMenuItem = (item, siblingIds = []) => {
        // Handle edge cases
        if (!item || !item.name) {
            return null;
        }

        // If this item has children, render a collapsible menu
        if (item.isParent && item.children && item.children.length > 0) {
            // Get sibling IDs for children (for nested accordion behavior)
            const childSiblingIds = item.children
                .filter(
                    (child) =>
                        child.isParent &&
                        child.children &&
                        child.children.length > 0
                )
                .map((child) => child.id);

            return (
                <li className="nav-item" key={item.id}>
                    <Link
                        className="nav-link menu-link"
                        to="#"
                        data-bs-toggle="collapse"
                        onClick={() => toggleItem(item.id, siblingIds)}
                        style={{ justifyContent: " !important" }}
                        aria-expanded={
                            expandedItems[item.id] ? "true" : "false"
                        }
                    >
                        {item.icon ? <i className={item.icon}></i> : null}
                        <span data-key="t-apps">{item.name}</span>
                    </Link>
                    <Collapse
                        className="menu-dropdown"
                        isOpen={expandedItems[item.id]}
                        data-group-name={item.name}
                    >
                        <ul className="nav nav-sm flex-column">
                            {/* Recursively render child items with their sibling IDs */}
                            {item.children.map((child) =>
                                renderMenuItem(child, childSiblingIds)
                            )}
                        </ul>
                    </Collapse>
                </li>
            );
        }
        // Otherwise, render a regular link
        else {
            return (
                <li className="nav-item" key={item.id}>
                    <Link
                        className="nav-link"
                        to={item.url}
                        onClick={() => handleMenuItemClick(item.id)}
                    >
                        {item.icon ? <i className={item.icon}></i> : null}
                        <span data-key="t-apps">{item.name}</span>
                    </Link>
                </li>
            );
        }
    };

    // Function to render a direct link menu group
    const renderDirectLinkMenuGroup = (group) => {
        // Validate the group object has the necessary properties
        if (!group || !group.groupName || !group.url) {
            return null;
        }

        return (
            <li className="nav-item" key={group.groupId}>
                <Link
                    className="nav-link menu-link"
                    to={group.url}
                    onClick={() => handleMenuItemClick(group.groupId)}
                >
                    {group.icon ? <i className={group.icon}></i> : null}
                    <span data-key="t-apps">{group.groupName}</span>
                </Link>
            </li>
        );
    };

    // Function to render a menu group with its menu items
    // siblingGroupIds contains IDs of all sibling groups for accordion behavior
    const renderMenuGroup = (group, siblingGroupIds = []) => {
        // Check if this is a direct link menu group
        if (group.isLink) {
            return renderDirectLinkMenuGroup(group);
        }

        // Validate the group object has the necessary properties
        if (!group || !group.groupName || !group.menus) {
            return null;
        }

        // Get sibling IDs for menu items within this group (for nested accordion behavior)
        const menuSiblingIds = group.menus
            .filter(
                (menu) =>
                    menu.isParent && menu.children && menu.children.length > 0
            )
            .map((menu) => menu.id);

        return (
            <li className="nav-item" key={group.groupId}>
                <Link
                    className="nav-link menu-link"
                    to="#"
                    data-bs-toggle="collapse"
                    onClick={() => toggleItem(group.groupId, siblingGroupIds)}
                    aria-expanded={
                        expandedItems[group.groupId] ? "true" : "false"
                    }
                >
                    {group.icon ? <i className={group.icon}></i> : null}
                    <span data-key="t-apps">{group.groupName}</span>
                </Link>

                <Collapse
                    className="menu-dropdown"
                    isOpen={expandedItems[group.groupId]}
                    data-group-name={group.groupName}
                >
                    <ul className="nav nav-sm flex-column">
                        {group.menus &&
                            group.menus.map((menu) =>
                                renderMenuItem(menu, menuSiblingIds)
                            )}
                    </ul>
                </Collapse>
            </li>
        );
    };

    return (
        <React.Fragment>
            <div className="mb-5">
                {/* menu Items */}
                <li className="menu-title">
                    <span
                        data-key="t-menu"
                        style={{ fontSize: "14px", padding: "0px" }}
                    >
                        Menu
                    </span>
                </li>

                {loading ? (
                    <li className="nav-item">
                        <span className="nav-link">Loading menus...</span>
                    </li>
                ) : (
                    <>
                        {Array.isArray(menuData) && menuData.length > 0 ? (
                            (() => {
                                // Get all sibling group IDs for top-level accordion behavior
                                const siblingGroupIds = menuData
                                    .filter(
                                        (g) =>
                                            !g.isLink &&
                                            g.menus &&
                                            g.menus.length > 0
                                    )
                                    .map((g) => g.groupId);
                                return menuData.map((group) =>
                                    renderMenuGroup(group, siblingGroupIds)
                                );
                            })()
                        ) : (
                            <>
                                <li className="nav-item">
                                    <span className="nav-link">
                                        No menu items available.
                                    </span>
                                </li>
                            </>
                        )}
                    </>
                )}
            </div>
        </React.Fragment>
    );
};

VerticalLayout.propTypes = {
    location: PropTypes.object,
};

export default withRouter(VerticalLayout);
