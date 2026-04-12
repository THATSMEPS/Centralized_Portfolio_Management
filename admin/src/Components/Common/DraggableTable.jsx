import React, { useMemo, useState, useEffect } from "react";
import "./DraggableTable.css";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RxDragHandleDots2 } from "react-icons/rx";

// Sortable Row Component
const SortableRow = ({ row, rowIndex, columns, id, rowKeyField }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        boxShadow: isDragging ? "0px 4px 10px rgba(0,0,0,0.1)" : "none",
        position: isDragging ? "relative" : "static",
        display: "flex",
        width: "100%",
        backgroundColor: "#fff",
        borderBottom: "1px solid #e9ebec",
        minHeight: "44px",
        height: "44px",
        touchAction: "none",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rdt_TableRow ${isDragging ? "shadow-sm border-primary" : ""}`}
        >
            <div
                className="rdt_TableCell d-flex align-items-center justify-content-center"
                style={{
                    minWidth: "44px",
                    maxWidth: "44px",
                    width: "44px",
                    height: "40px",
                    padding: "4px 8px",
                    cursor: isDragging ? "grabbing" : "grab",
                }}
                {...attributes}
                {...listeners}
            >
                <RxDragHandleDots2 size={20} className="text-secondary" />
            </div>

            {columns.map((col, index) => {
                let content = null;
                if (col.cell) {
                    content = col.cell(row, rowIndex, col, id);
                } else if (col.selector) {
                    content = col.selector(row, rowIndex);
                }
                // Force left alignment for all columns
                return (
                    <div
                        key={index}
                        className="rdt_TableCell d-flex align-items-center"
                        title={typeof content === 'string' ? content : undefined}
                        style={{
                            minWidth: "120px",
                            maxWidth: "320px",
                            width: "100%",
                            height: "40px",
                            padding: "4px 12px",
                            flexGrow: 1,
                            flexShrink: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'left',
                            ...col.style,
                        }}
                    >
                        {content}
                    </div>
                );
            })}
        </div>
    );
};

// Main Draggable Table Component
const DraggableTable = ({
    columns,
    data,
    keyField = "_id", // Default to MongoDB _id convention
    onReorder,
    progressPending,
}) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (data && data.length > 0) {
            setItems(data);
        } else {
            setItems([]);
        }
    }, [data]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const itemIds = useMemo(() => items.map((item) => item[keyField]), [items, keyField]);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item[keyField] === active.id);
                const newIndex = items.findIndex((item) => item[keyField] === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Ensure strictly new order triggers logic
                if (onReorder) {
                    // Optional: Re-stamp sequences dynamically starting from lowest or 1
                    const reorderedWithSequence = newItems.map((item, index) => ({
                        ...item,
                        // Assign new sequence visual property for display if needed
                        tempSequence: index + 1 // temporary property
                    }));

                    onReorder(newItems);
                }

                return newItems;
            });
        }
    };

    if (progressPending) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="rdt_Table" role="table" style={{ width: "100%" }}>
            {/* Table Header Row */}
            <div className="rdt_TableHead" role="rowgroup" style={{ display: "flex", width: "100%", borderBottom: "1.5px solid #e9ebec", backgroundColor: '#fafbfc', fontWeight: 600 }}>
                <div className="rdt_TableHeadRow" style={{ display: "flex", width: "100%", minHeight: "40px", height: "40px" }}>
                    <div
                        className="rdt_TableCol d-flex align-items-center justify-content-center"
                        style={{ minWidth: "44px", maxWidth: "44px", width: "44px", height: "40px", flexGrow: 0, flexShrink: 0, padding: "4px 8px" }}
                    >
                        {/* Empty space for drag handle */}
                    </div>
                    {columns.map((col, index) => (
                        <div
                            key={index}
                            className="rdt_TableCol d-flex align-items-center text-muted"
                            style={{
                                minWidth: "120px",
                                maxWidth: "320px",
                                width: "100%",
                                height: "40px",
                                padding: "4px 12px",
                                flexGrow: 1,
                                flexShrink: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: 'left',
                                ...col.style,
                            }}
                        >
                            {col.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Body */}
            <div className="rdt_TableBody" role="rowgroup">
                {items.length === 0 ? (
                    <div className="p-3 text-center text-muted">There are no records to display</div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                            {items.map((row, index) => (
                                <SortableRow
                                    key={row[keyField]}
                                    id={row[keyField]}
                                    row={row}
                                    rowIndex={index}
                                    columns={columns}
                                    rowKeyField={keyField}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
};

export default DraggableTable;
