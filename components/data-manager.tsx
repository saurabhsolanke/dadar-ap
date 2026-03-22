import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Search, X, Upload } from "lucide-react";
import { uploadImage } from "@/app/actions/upload";
import { listUsers, deleteUser, updateUser } from "@/lib/actions/users";
import { toast } from "sonner";

export type FieldType = "text" | "textarea" | "number" | "date" | "image" | "images" | "geopoint" | "rating" | "priceRange" | "select" | "boolean";

export interface FieldDefinition {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    showInTable?: boolean;
    defaultValue?: string | number | boolean | string[];
}

interface Item {
    id: string;
    [key: string]: string | number | boolean | string[] | { seconds: number } | { latitude: number; longitude: number } | undefined;
}

interface DataManagerProps {
    collectionName: string;
    title: string;
    schema: FieldDefinition[];
    hideTitle?: boolean;
}

export function DataManager({ collectionName, title, schema, hideTitle = false }: DataManagerProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Track edit mode

    const [editId, setEditId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Filter, Sort, Pagination State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form State
    const [formData, setFormData] = useState<Item>({ id: "" });

    useEffect(() => {
        if (collectionName === "users") {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    const data = await listUsers();
                    if (Array.isArray(data)) {
                        setItems(data as Item[]);
                    } else if (data && typeof data === 'object' && 'error' in data) {
                        console.error("Server error fetching users:", data.error);
                        setItems([]); // Clear items on error
                        toast.error(`Error fetching users: ${data.error}`, {
                            description: "Please ensure Firebase Admin credentials are set in .env.local"
                        });
                    }
                } catch (error) {
                    console.error("Error fetching users:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
            return;
        }

        const q = query(collection(db, collectionName));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Item[];
            setItems(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName]);

    const handleOpenAdd = () => {
        // Reset form data based on schema
        const initialData: Item = { id: "" };
        schema.forEach(field => {
            if (field.defaultValue !== undefined) {
                 initialData[field.name] = field.defaultValue;
            } else {
                 initialData[field.name] = field.type === "images" ? [] : "";
            }
        });
        setFormData(initialData);
        setIsEditing(false);
        setEditId(null);
        setIsOpen(true);
    };

    const handleEdit = (item: Item) => {
        setFormData({ ...item });
        setIsEditing(true);
        setEditId(item.id);
        setIsOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && editId) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: _, ...dataToUpdate } = formData;
                
                if (collectionName === "users") {
                    await updateUser(editId, dataToUpdate as any);
                    // Refresh users list manually since no snapshot
                    const data = await listUsers();
                    setItems(data as Item[]);
                } else {
                    await updateDoc(doc(db, collectionName, editId), {
                        ...dataToUpdate,
                        updatedAt: new Date().toISOString(),
                    });
                }
            } else {
                if (collectionName === "users") {
                   toast.warning("Creating users via this form is not supported. Use the Firebase Console or an admin action.");
                   return;
                }
                await addDoc(collection(db, collectionName), {
                    ...formData,
                    createdAt: new Date().toISOString(),
                });
            }
            setIsOpen(false);
        } catch (error) {
            console.error("Error saving document:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                if (collectionName === "users") {
                    await deleteUser(id);
                    // Refresh users list manually
                    const data = await listUsers();
                    setItems(data as Item[]);
                } else {
                    await deleteDoc(doc(db, collectionName, id));
                }
            } catch (error) {
                console.error("Error deleting document:", error);
            }
        }
    };

    const handleChange = (name: string, value: string | number | boolean | string[]) => {
        setFormData((prev: Item) => ({ ...prev, [name]: value }));
    };

    const formatCellValue = (value: string | number | boolean | string[] | { seconds: number } | { latitude: number; longitude: number } | undefined, type: FieldType) => {
        if (value === undefined || value === null) return "";

        if (typeof value === "object" && "seconds" in value) {
            // Firestore Timestamp
            return new Date(value.seconds * 1000).toLocaleDateString();
        }

        switch (type) {
            case "date": {
                const dateVal = typeof value === "string" || typeof value === "number" ? value : undefined;
                return dateVal ? new Date(dateVal).toLocaleDateString() : "";
            }
            case "image":
                return value ? <Image src={value as string} alt="Thumb" width={32} height={32} className="h-8 w-8 object-cover rounded" /> : "";
            case "images":
                return Array.isArray(value) && value.length > 0 ? (
                    <div className="flex items-center gap-2">
                        <Image src={(value as string[])[0]} alt="Thumb" width={32} height={32} className="h-8 w-8 object-cover rounded" />
                        <span className="text-xs text-muted-foreground">({value.length})</span>
                    </div>
                ) : "0 images";
            case "geopoint":
                if (typeof value === 'object' && value !== null && !Array.isArray(value) && 'latitude' in value) {
                    const geo = value as { latitude: number, longitude: number };
                    return `${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)}`;
                }
                return String(value || ""); 
            case "rating":
                return `★ ${value}`;
            case "priceRange":
                return String(value || "");
            case "boolean":
                return value ? "Yes" : "No";
            default:
                // Truncate long text
                const str = String(value);
                return str.length > 50 ? str.substring(0, 50) + "..." : str;
        }
    };

    // --- Search, Sort, Pagination Logic ---

    const filteredItems = items.filter((item) => {
        const query = searchQuery.toLowerCase();
        // Search across all text-like fields defined in schema
        return schema.some(field => {
            if (field.type === 'text' || field.type === 'textarea') {
                return String(item[field.name] || "").toLowerCase().includes(query);
            }
            return false;
        });
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        const valA = a[key] || "";
        const valB = b[key] || "";

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
    const paginatedItems = sortedItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (current?.key === key) {
                return { key, direction: current.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
    };

    // Helper for GeoPoint string parsing "lat,lng"
    // const handleGeoPointChange = (name: string, value: string) => {
    //     // We store as string or object? 
    //     // User request: [19.0269° N, 72.8383° E] (geopoint). Firestore uses GeoPoint object.
    //     // For simplicity let's try to store as { latitude: x, longitude: y } or just keep as string if not strictly firestore geopoint.
    //     // Let's assume we store as { latitude: number, longitude: number } for now.
    //     // But input is simple text.
    //     setFormData((prev: Item) => ({ ...prev, [name]: value }));
    // };

    // const handleImageUpload = async (files: FileList | null, fieldName: string) => {
    //     if (!files || files.length === 0) return;

    //     setIsUploading(true);
    //     setUploadProgress(0);
    //     const uploadedUrls: string[] = [];
    //     let completedUploads = 0;
    //     const totalFiles = files.length;

    //     try {
    //         for (let i = 0; i < files.length; i++) {
    //             const file = files[i];
    //             const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    //             const uploadTask = uploadBytesResumable(storageRef, file);

    //             await new Promise<void>((resolve, reject) => {
    //                 uploadTask.on('state_changed',
    //                     (snapshot) => {
    //                         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //                         // Calculate total progress based on current file and previously completed files
    //                         const currentTotalProgress = ((completedUploads + (progress / 100)) / totalFiles) * 100;
    //                         setUploadProgress(Math.round(currentTotalProgress));
    //                     },
    //                     (error) => {
    //                         console.error("Upload error:", error);
    //                         reject(error);
    //                     },
    //                     async () => {
    //                         const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    //                         uploadedUrls.push(downloadURL);
    //                         completedUploads++;
    //                         resolve();
    //                     }
    //                 );
    //             });
    //         }

    //         setFormData((prev: any) => {
    //             const currentImages = prev[fieldName] || [];
    //             return {
    //                 ...prev,
    //                 [fieldName]: [...currentImages, ...uploadedUrls]
    //             };
    //         });
    //     } catch (error) {
    //         console.error("Error uploading images:", error);
    //         alert("Failed to upload images. Please check your connection and try again.");
    //     } finally {
    //         setIsUploading(false);
    //         setUploadProgress(0);
    //     }
    //     }
    // };

    const handleRemoveImage = (fieldName: string, indexToRemove: number) => {
        setFormData((prev: Item) => {
            const currentImages = (prev[fieldName] as string[]) || [];
            return {
                ...prev,
                [fieldName]: currentImages.filter((_, index: number) => index !== indexToRemove)
            };
        });
    };



    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadImage(formData);

            if (result.success && result.url) {
                setFormData((prev: Item) => {
                    const currentImages = (prev[fieldName] as string[]) || [];
                    return {
                        ...prev,
                        [fieldName]: [...currentImages, result.url]
                    };
                });
            } else {
                console.error("Upload failed:", result.error);
                toast.error("Upload failed", {
                    description: "Check console for details."
                });
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {!hideTitle && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <Button onClick={handleOpenAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {schema.filter(f => f.showInTable).map((field) => (
                                <TableHead
                                    key={field.name}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort(field.name)}
                                >
                                    {field.label} <ArrowUpDown className="ml-2 inline h-4 w-4" />
                                </TableHead>
                            ))}
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={schema.filter(f => f.showInTable).length + 1} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : paginatedItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={schema.filter(f => f.showInTable).length + 1} className="text-center h-24">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedItems.map((item) => (
                                <TableRow key={item.id}>
                                    {schema.filter(f => f.showInTable).map((field) => (
                                        <TableCell key={field.name} className="max-w-[150px] truncate">
                                            {formatCellValue(item[field.name], field.type)}
                                        </TableCell>
                                    ))}
                                    <TableCell className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <span className="text-sm text-muted-foreground mr-4">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto bg-background dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-100 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit' : 'Add'} {title.slice(0, -1)}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Make changes to the item.' : 'Add details for the new item.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {schema.map((field) => (
                            <div key={field.name} className="grid gap-2">
                                <Label htmlFor={field.name}>{field.label}</Label>

                                {field.type === 'textarea' && (
                                    <Textarea
                                        id={field.name}
                                        value={(formData[field.name] as string | number) || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        required={field.required}
                                    />
                                )}

                                {field.type === 'images' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            {Array.isArray(formData[field.name]) && (formData[field.name] as string[]).map((url: string, index: number) => (
                                                <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                                                    <Image src={url} alt={`Upload ${index}`} fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(field.name, index)}
                                                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id={`file-upload-${field.name}`}
                                                type="file"
                                                accept="image/*"
                                                disabled={uploading}
                                                onChange={(e) => handleFileUpload(e, field.name)}
                                                className="hidden"
                                            />
                                            <Label
                                                htmlFor={`file-upload-${field.name}`}
                                                className={`flex items-center gap-2 cursor-pointer px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                {uploading ? (
                                                    <span className="animate-pulse">Uploading...</span>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4" />
                                                        Upload Image
                                                    </>
                                                )}
                                            </Label>
                                        </div>
                                    </div>
                                )}

                                {(field.type === 'text' || field.type === 'image' || field.type === 'geopoint' || field.type === 'priceRange') && (
                                    <Input
                                        id={field.name}
                                        type="text"
                                        value={(formData[field.name] as string) || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        required={field.required}
                                    />
                                )}

                                {field.type === 'number' && (
                                    <Input
                                        id={field.name}
                                        type="number"
                                        step="any"
                                        value={(formData[field.name] as string | number) || ""}
                                        onChange={(e) => handleChange(field.name, parseFloat(e.target.value))}
                                        required={field.required}
                                    />
                                )}

                                {field.type === 'rating' && (
                                    <Input
                                        id={field.name}
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={(formData[field.name] as string | number) || ""}
                                        onChange={(e) => handleChange(field.name, parseFloat(e.target.value))}
                                        required={field.required}
                                    />
                                )}

                                {field.type === 'date' && (
                                    <Input
                                        id={field.name}
                                        type="datetime-local"
                                        value={(formData[field.name] as string | number) || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        required={field.required}
                                    />
                                )}

                                {field.type === 'boolean' && (
                                    <Input
                                        id={field.name}
                                        className="h-auto"
                                        type="checkbox"
                                        checked={(formData[field.name] as boolean) || false}
                                        onChange={(e) => handleChange(field.name, e.target.checked)}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
