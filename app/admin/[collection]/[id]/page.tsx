"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUser, updateUser, deleteUser as deleteUserAction } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Trash2, Check, X } from "lucide-react";

const collectionConfig: Record<string, { name: string; label: string; type: string }[]> = {
    shops: [{ name: "location", label: "Location", type: "text" }],
    events: [
        { name: "date", label: "Date", type: "date" },
        { name: "location", label: "Location", type: "text" },
    ],
    places: [{ name: "location", label: "Location", type: "text" }],
    news: [
        { name: "source", label: "Source", type: "text" },
        { name: "date", label: "Date", type: "date" },
        { name: "content", label: "Content", type: "textarea" },
    ],
    blogs: [
        { name: "author", label: "Author", type: "text" },
        { name: "date", label: "Date", type: "date" },
        { name: "tags", label: "Tags", type: "text" },
        { name: "content", label: "Content", type: "textarea" },
    ],
    experience: [
        { name: "title", label: "Title", type: "text" },
        { name: "author", label: "Author", type: "text" },
        { name: "date", label: "Date", type: "date" },
        { name: "content", label: "Content", type: "textarea" },
        { name: "latitude", label: "Latitude", type: "number" },
        { name: "longitude", label: "Longitude", type: "number" },
        { name: "isApproved", label: "Approved", type: "boolean" },
    ],
    users: [
        { name: "email", label: "Email", type: "email" },
        { name: "role", label: "Role", type: "text" }
    ]
};

export default function DetailPage() {
    const router = useRouter();
    const params = useParams();
    const collectionName = params.collection as string;
    const id = params.id as string;

    const [formData, setFormData] = useState<Record<string, string | number | boolean | string[] | undefined>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const extraFields = collectionConfig[collectionName] || [];

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !collectionName) return;
            try {
                if (collectionName === "users") {
                    const user = await getUser(id);
                    if (user) {
                        setFormData({
                            id: user.uid,
                            name: user.displayName || "",
                            email: user.email,
                            role: user.customClaims?.role || "",
                            description: "Managed via Auth", // Placeholder
                        });
                    } else {
                        console.error("User not found via Auth");
                        // fallback?
                    }
                } else {
                    const docRef = doc(db, collectionName, id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setFormData({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        console.error("Document not found");
                        router.push("/admin");
                    }
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, collectionName, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (collectionName === "users") {
                await updateUser(id, formData);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: _, ...data } = formData;
                await updateDoc(doc(db, collectionName, id), {
                    ...data,
                });
            }
            router.push("/admin");
        } catch (error) {
            console.error("Error updating document:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
            try {
                if (collectionName === "users") {
                    await deleteUserAction(id);
                } else {
                    await deleteDoc(doc(db, collectionName, id));
                }
                router.push("/admin");
            } catch (error) {
                console.error("Error deleting document:", error);
            }
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold capitalize">Edit {collectionName.slice(0, -1)}</h1>
                </div>
                <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={(formData.name as any) || ""}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        name="description"
                        value={(formData.description as any) || ""}
                        onChange={handleChange}
                    />
                </div>
                {extraFields.map((field) => (
                    <div key={field.name} className="grid gap-2">
                        <Label htmlFor={field.name}>{field.label}</Label>
                        {field.type === "textarea" ? (
                            <Textarea
                                id={field.name}
                                name={field.name}
                                value={(formData[field.name] as any) || ""}
                                onChange={handleChange}
                                className="min-h-[200px]"
                            />
                        ) : field.type === "boolean" ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant={formData[field.name] ? "default" : "outline"}
                                    className={formData[field.name] ? "bg-green-600 hover:bg-green-700" : ""}
                                    onClick={() => setFormData({ ...formData, [field.name]: !formData[field.name] })}
                                >
                                    {formData[field.name] ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Approved
                                        </>
                                    ) : (
                                        <>
                                            <X className="mr-2 h-4 w-4" />
                                            Not Approved
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <Input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                value={(formData[field.name] as any) || ""}
                                onChange={handleChange}
                            />
                        )}
                    </div>
                ))}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
