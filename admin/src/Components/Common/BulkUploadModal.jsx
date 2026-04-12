import React, { useState, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Alert, Input, Label } from 'reactstrap';
import { downloadCSVTemplate, parseCSV } from '../../helpers/csvHelper';

const BulkUploadModal = ({ isOpen, toggle, onSave, columns, templateName = "data" }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef(null);

    const handleDownloadTemplate = () => {
        downloadCSVTemplate(columns, `${templateName}_template.csv`);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setError(null);
        setData([]);

        parseCSV(file, (parsedData, err) => {
            if (err) {
                setError(err);
            } else {
                setData(parsedData);
            }
        });
    };

    const handleSave = () => {
        if (data.length === 0) return;
        onSave(data);
        handleClose();
    };

    const handleClose = () => {
        setData([]);
        setFileName("");
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={handleClose} size="lg" scrollable>
            <ModalHeader toggle={handleClose}>Bulk Upload {templateName}</ModalHeader>
            <ModalBody>
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h6 className="mb-1">1. Download Template</h6>
                            <p className="text-muted small mb-0">Get a blank CSV with required columns.</p>
                        </div>
                        <Button color="light" size="sm" onClick={handleDownloadTemplate}>
                            <i className="ri-download-line me-1"></i> Download CSV
                        </Button>
                    </div>

                    <div className="mb-3">
                        <h6 className="mb-1">2. Upload Filled CSV</h6>
                        <p className="text-muted small mb-2">Upload the file with your data.</p>
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            innerRef={fileInputRef}
                        />
                    </div>
                </div>

                {error && <Alert color="danger">{error}</Alert>}

                {data.length > 0 && (
                    <div className="mt-4">
                        <h6 className="mb-2">Preview ({data.length} records)</h6>
                        <div className="table-responsive">
                            <Table className="table-sm table-bordered mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light">
                                    <tr>
                                        {columns.map((col, idx) => (
                                            <th key={idx}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(0, 5).map((row, rowIdx) => (
                                        <tr key={rowIdx}>
                                            {columns.map((col, colIdx) => (
                                                <td key={colIdx}>{row[col] || "-"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            {data.length > 5 && (
                                <div className="text-center p-2 text-muted fst-italic bg-light border-top border-bottom">
                                    ...and {data.length - 5} more rows
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={handleClose}>Cancel</Button>
                <Button color="primary" onClick={handleSave} disabled={data.length === 0}>
                    Import Data
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default BulkUploadModal;
