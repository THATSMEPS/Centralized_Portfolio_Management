import { toast } from "react-toastify";

/**
 * Uploads images in bulk by passing them to an update function sequentially.
 * 
 * @param {Array} pairs Array of { item, file } from the BulkImageUploadModal
 * @param {Function} updateApiFunction The API function to call (e.g. updateCategory, updateFoodItem)
 * @param {Function} onSuccess Callback after all are done.
 * @param {Function} setProgress Optional callback to update progress
 */
export const bulkImageUpload = async (pairs, updateApiFunction, onSuccess, setProgress) => {
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < pairs.length; i++) {
        const { item, file } = pairs[i];
        try {
            const formData = new FormData();
            formData.append("image", file); // Assuming key is 'image'

            if (setProgress) setProgress(i + 1, pairs.length);

            const response = await updateApiFunction(item._id || item.id, formData);
            if (response && response.isOk) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            console.error(`Error uploading image for ${item.name || item.title || item.itemName}:`, error);
            failCount++;
        }
    }

    if (failCount === 0) {
        toast.success(`Successfully uploaded ${successCount} images.`);
    } else {
        toast.warning(`Uploaded ${successCount} images, ${failCount} failed.`);
    }

    if (onSuccess) onSuccess();
};
