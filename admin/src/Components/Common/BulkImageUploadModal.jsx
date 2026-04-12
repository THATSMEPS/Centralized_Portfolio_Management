import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Table } from "reactstrap";

const BulkImageUploadModal = ({ isOpen, toggle, items, itemNameKey, onSave, isUploading }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewPairs, setPreviewPairs] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedFiles([]);
            setPreviewPairs([]);
        }
    }, [isOpen]);

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);

        // Sort files alphabetically to ensure strict sequence
        files.sort((a, b) => a.name.localeCompare(b.name));
        setSelectedFiles(files);

        // Pair files with items sequentially
        const pairs = [];
        const length = Math.min(files.length, items.length);
        for (let i = 0; i < length; i++) {
            pairs.push({
                item: items[i],
                file: files[i],
                preview: URL.createObjectURL(files[i])
            });
        }
        setPreviewPairs(pairs);
    };

    const handleUpload = () => {
        if (previewPairs.length > 0) {
            onSave(previewPairs);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
            <ModalHeader toggle={toggle}>
                Bulk Image Upload
                <p className="text-muted fs-13 mb-0 mt-1">
                    Select a folder or multiple images. They will be mapped to the items sequentially based on filenames and item order.
                </p>
            </ModalHeader>
            <ModalBody>
                <div className="mb-4">
                    <div className="d-flex gap-2">
                        <div className="flex-grow-1">
                            <label className="form-label">Upload exact Folder</label>
                            <input
                                type="file"
                                webkitdirectory="true"
                                directory="true"
                                multiple
                                onChange={handleFilesChange}
                                className="form-control"
                                disabled={isUploading}
                            />
                        </div>
                        <div className="flex-grow-1">
                            <label className="form-label">Or Multiple Files</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFilesChange}
                                className="form-control"
                                disabled={isUploading}
                            />
                        </div>
                    </div>
                    <div className="mt-2 text-muted">
                        <small>Files are automatically sorted by name (01.jpg, 02.jpg, etc) before mapping to items.</small>
                    </div>
                </div>

                {previewPairs.length > 0 && (
                    <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                        <Table bordered hover>
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>#</th>
                                    <th>Image Preview</th>
                                    <th>File Name</th>
                                    <th>Mapped To ({itemNameKey})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewPairs.map((pair, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <img
                                                src={pair.preview}
                                                alt="preview"
                                                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                                            />
                                        </td>
                                        <td>{pair.file.name}</td>
                                        <td><strong>{pair.item[itemNameKey] || "Unknown Item"}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}

                {selectedFiles.length > items.length && (
                    <div className="alert alert-warning mt-3">
                        <strong>Note:</strong> You selected {selectedFiles.length} files, but there are only {items.length} items available. The extra {selectedFiles.length - items.length} files will be ignored.
                    </div>
                )}

                {selectedFiles.length > 0 && selectedFiles.length < items.length && (
                    <div className="alert alert-info mt-3">
                        <strong>Note:</strong> You selected {selectedFiles.length} files. The remaining {items.length - selectedFiles.length} items will not be updated.
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={toggle} disabled={isUploading}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleUpload} disabled={previewPairs.length === 0 || isUploading}>
                    {isUploading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Uploading...
                        </>
                    ) : (
                        `Upload ${previewPairs.length} Images`
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default BulkImageUploadModal;
