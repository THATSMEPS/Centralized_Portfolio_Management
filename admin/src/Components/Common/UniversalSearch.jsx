import React, { useState, useEffect, useContext, useRef } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { MenuContext } from "../../context/MenuContext";

const UniversalSearch = () => {
    const [searchOptions, setSearchOptions] = useState([]);
    const selectRef = useRef(null);
    const navigate = useNavigate();
    const { menuData } = useContext(MenuContext);

    // Flatten menu structure into searchable options
    useEffect(() => {
        if (!menuData || menuData.length === 0) return;

        console.log("📊 RAW MENU DATA:", JSON.stringify(menuData, null, 2));

        const options = [];

        const flattenMenus = (
            items,
            groupName = "",
            parentPath = [],
            depth = 0
        ) => {
            console.log(
                `${"  ".repeat(
                    depth
                )}🔍 Processing level ${depth}, groupName: "${groupName}", parentPath: [${parentPath.join(
                    ", "
                )}]`
            );

            items.forEach((item, index) => {
                console.log(`${"  ".repeat(depth)}  Item ${index}:`, {
                    name: item.name || item.groupName,
                    hasGroupId: !!item.groupId,
                    hasMenus: !!(item.menus && item.menus.length),
                    hasChildren: !!(item.children && item.children.length),
                    hasUrl: !!item.url,
                    isLink: item.isLink,
                    url: item.url,
                });

                // Handle menu groups (check for groupId property, not menus.length)
                if (item.groupId || (item.menus && item.menus.length > 0)) {
                    console.log(
                        `${"  ".repeat(depth)}    ✅ Is a GROUP${
                            item.menus ? ` with ${item.menus.length} menus` : ""
                        }`
                    );

                    // Check if this is a direct link group
                    if (item.isLink && item.url && item.url !== "#") {
                        console.log(
                            `${"  ".repeat(
                                depth
                            )}    ➕ Adding direct link group: ${
                                item.groupName
                            }`
                        );
                        options.push({
                            value: item.url,
                            label: item.groupName,
                            name: item.groupName,
                            group: "",
                        });
                    }
                    // Recursively flatten the group's menus (if any)
                    if (item.menus && item.menus.length > 0) {
                        flattenMenus(item.menus, item.groupName, [], depth + 1);
                    }
                }
                // Handle menu items with children
                else if (item.children && item.children.length > 0) {
                    console.log(
                        `${"  ".repeat(depth)}    ✅ Has ${
                            item.children.length
                        } CHILDREN`
                    );

                    // Don't add parent menus with url "#" - they're not navigable
                    // Just pass them in the path for their children
                    const newPath = [...parentPath, item.name];

                    // Recursively flatten children
                    flattenMenus(item.children, groupName, newPath, depth + 1);
                }
                // Handle direct menu items (leaf nodes)
                else if (item.url && item.url !== "#") {
                    // Build the label from the full path
                    const fullPath = groupName
                        ? [groupName, ...parentPath, item.name]
                        : [...parentPath, item.name];
                    const label = fullPath.join(" > ");

                    console.log(
                        `${"  ".repeat(depth)}    ➕ Adding leaf menu: ${label}`
                    );
                    options.push({
                        value: item.url,
                        label: label,
                        name: item.name,
                        group: groupName,
                        parent: parentPath.join(" > "),
                    });
                }
            });
        };

        flattenMenus(menuData);

        console.log("✅ FINAL SEARCH OPTIONS:", options);
        console.log("📈 Total options:", options.length);

        setSearchOptions(options);
    }, [menuData]);

    // Listen for Ctrl+S to focus the search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                if (selectRef.current) {
                    selectRef.current.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSelect = (selectedOption) => {
        if (selectedOption && selectedOption.value) {
            navigate(selectedOption.value);
            // Clear selection after navigation
            if (selectRef.current) {
                selectRef.current.clearValue();
            }
        }
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minWidth: "350px",
            maxWidth: "550px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#f1f5f9",
            boxShadow: state.isFocused
                ? "0 0 0 2px rgba(37, 99, 235, 0.1)"
                : "none",
            "&:hover": {
                backgroundColor: "#e2e8f0",
            },
            minHeight: "42px",
            cursor: "text",
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "10px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 1050,
            marginTop: "8px",
            border: "none",
            overflow: "hidden",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#2563eb" : "white",
            color: state.isFocused ? "white" : "#1e293b",
            cursor: "pointer",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            "&:active": {
                backgroundColor: "#1d4ed8",
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#64748b",
            fontSize: "14px",
            fontWeight: "400",
        }),
        input: (provided) => ({
            ...provided,
            color: "#1e293b",
            fontSize: "14px",
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: "2px 16px",
        }),
    };

    return (
        <div
            className="d-flex align-items-center"
            style={{
                flex: 1,
                justifyContent: "center",
                maxWidth: "600px",
                margin: "0 20px",
            }}
        >
                <Select
                    ref={selectRef}
                    options={searchOptions}
                    onChange={handleSelect}
                    placeholder="Search dashboards..."
                    styles={customStyles}
                    isClearable
                    noOptionsMessage={() => "No menus found"}
                />
            </div>
    );
};

export default UniversalSearch;
