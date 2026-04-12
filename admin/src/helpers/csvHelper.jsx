import Papa from 'papaparse';

/**
 * Downloads a CSV template with the specified columns.
 * @param {string[]} columns - Array of column headers.
 * @param {string} filename - Name of the file to download.
 */
export const downloadCSVTemplate = (columns, filename = 'template.csv') => {
    const csvContent = "data:text/csv;charset=utf-8," + columns.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Parses a CSV file and returns an array of objects.
 * Assumes the first row is the header.
 * @param {File} file - The CSV file to parse.
 * @param {Function} callback - Callback function that receives (data, error).
 */
export const parseCSV = (file, callback) => {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            if (results.errors && results.errors.length > 0) {
                // If there are critical errors, you could return them instead:
                // callback([], "Error parsing file");
                // For now, we prefer to give as much data as possible, 
                // but if there are completely broken rows, we just continue
            }
            if (results.data.length === 0) {
                callback([], "File contains no data rows");
                return;
            }
            callback(results.data, null);
        },
        error: function (error) {
            callback([], error.message || "Failed to parse CSV file");
        }
    });
};
