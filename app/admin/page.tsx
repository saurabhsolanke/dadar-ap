"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { 
    Bell,
    Sparkles,
    Store, 
    Calendar, 
    Building2, 
    MapPin, 
    Newspaper, 
    FileText, 
    Users, 
    MessageSquare,
    Search,
    ChevronRight,
    Command,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DataManager, FieldDefinition } from "@/components/data-manager";

export default function AdminDashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState("shops");

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push("/admin/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const menuGroups = [
        {
            title: "Platform",
            items: [
                { id: "shops", label: "Shops", icon: Store },
                { id: "events", label: "Events", icon: Calendar },
                { id: "hotels", label: "Hotels", icon: Building2 },
                { id: "places", label: "Places", icon: MapPin },
            ]
        },
        {
            title: "Content",
            items: [
                { id: "news", label: "News", icon: Newspaper },
                { id: "blogs", label: "Blogs", icon: FileText },
                { id: "experience", label: "Experience", icon: Sparkles },
            ]
        },
        {
            title: "Management",
            items: [
                { id: "users", label: "Users", icon: Users },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "contact", label: "Contact Us", icon: MessageSquare },
            ]
        }
    ];

    const shopSchema: FieldDefinition[] = [
        { name: "name", label: "Name", type: "text", required: true, showInTable: true },
        { name: "category", label: "Category", type: "text", showInTable: true },
        { name: "location", label: "Location", type: "text", showInTable: true },
        { name: "rating", label: "Rating", type: "rating", showInTable: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "images", label: "Images", type: "images" },
    ];

    const eventSchema: FieldDefinition[] = [
        { name: "title", label: "Title", type: "text", required: true, showInTable: true },
        { name: "date", label: "Date", type: "date", showInTable: true },
        { name: "location", label: "Location", type: "text", showInTable: true },
        { name: "organizer", label: "Organizer", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "images", label: "Images", type: "images" },
    ];

    const placeSchema: FieldDefinition[] = [
        { name: "title", label: "Title", type: "text", required: true, showInTable: true },
        { name: "category", label: "Category", type: "text", showInTable: true },
        { name: "location", label: "Location", type: "text", showInTable: true },
        { name: "rating", label: "Rating", type: "rating", showInTable: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "geoPoint", label: "GeoPoint", type: "geopoint" },
        { name: "images", label: "Images", type: "images" },
    ];

    const hotelSchema: FieldDefinition[] = [
        { name: "title", label: "Title", type: "text", required: true, showInTable: true },
        { name: "location", label: "Location", type: "text", showInTable: true },
        { name: "priceRange", label: "Price Range", type: "priceRange", showInTable: true },
        { name: "rating", label: "Rating", type: "rating", showInTable: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "images", label: "Images", type: "images" },
    ];

    const newsSchema: FieldDefinition[] = [
        { name: "source", label: "Source", type: "text", required: true, showInTable: true },
        { name: "date", label: "Date", type: "date", showInTable: true },
        { name: "content", label: "Content", type: "textarea" },
        { name: "title", label: "Title", type: "text", required: true, showInTable: true },
        { name: "images", label: "Images", type: "images" },
    ];

    const blogSchema: FieldDefinition[] = [
        { name: "title", label: "Title", type: "text", required: true, showInTable: true },
        { name: "author", label: "Author", type: "text", showInTable: true },
        { name: "date", label: "Date", type: "date", showInTable: true },
        { name: "tags", label: "Tags", type: "text" },
        { name: "content", label: "Content", type: "textarea" },
        { name: "images", label: "Images", type: "images" },
    ];

    const experienceSchema: FieldDefinition[] = [
        { name: "title", label: "Title", type: "text", required: true, showInTable: true },
        { name: "author", label: "Author", type: "text", showInTable: true },
        { name: "date", label: "Date", type: "date", showInTable: true },
        { name: "content", label: "Content", type: "textarea" },
        { name: "images", label: "Images", type: "images" },
        { name: "latitude", label: "Latitude", type: "number", required: true, showInTable: true },
        { name: "longitude", label: "Longitude", type: "number", required: true, showInTable: true },
        { name: "isApproved", label: "Approved", type: "boolean", defaultValue: true, showInTable: true },
    ];

    const notificationSchema: FieldDefinition[] = [
        { name: "title", label: "Title", type: "text", required: true, showInTable: true },
        { name: "message", label: "Message", type: "textarea", required: true, showInTable: true },
        { name: "type", label: "Type", type: "text", showInTable: true },
        { name: "date", label: "Date", type: "date", showInTable: true },
        { name: "target", label: "Target Audience", type: "text" },
    ];

    const userSchema: FieldDefinition[] = [
        { name: "id", label: "User UID", type: "text", showInTable: true },
        { name: "email", label: "Email", type: "text", required: true, showInTable: true },
        { name: "role", label: "Role", type: "text", showInTable: true },
        { name: "createdAt", label: "Created", type: "date", showInTable: true },
        { name: "lastSignInTime", label: "Signed In", type: "date", showInTable: true },
    ];

    const contactSchema: FieldDefinition[] = [
        { name: "name", label: "Name", type: "text", required: true, showInTable: true },
        { name: "email", label: "Email", type: "text", required: true, showInTable: true },
        { name: "phone", label: "Phone", type: "text", showInTable: true },
        { name: "message", label: "Message", type: "textarea", showInTable: true },
        { name: "createdAt", label: "Date", type: "date", showInTable: true },
    ];

    const getActiveGroup = () => {
        return menuGroups.find(group => group.items.find(item => item.id === activeView))?.title || "Dashboard";
    };

    const getActiveLabel = () => {
        for (const group of menuGroups) {
            const item = group.items.find(i => i.id === activeView);
            if (item) return item.label;
        }
        return "";
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 z-30 hidden h-screen w-64 border-r bg-background md:block">
                <div className="h-full flex flex-col">
                    <div className="flex h-14 items-center border-b px-6 font-semibold">
                        <div className="flex items-center gap-2 font-bold">
                            <Command className="h-6 w-6" />
                            <span>Dadar Admin Panel</span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-8" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <nav className="grid items-start px-4 text-sm font-medium">
                            {menuGroups.map((group, index) => (
                                <div key={index} className="mb-6">
                                    <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                                        {group.title}
                                    </h3>
                                    <div className="grid gap-1">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveView(item.id)}
                                                    className={cn(
                                                        "group flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground",
                                                        activeView === item.id && "bg-accent text-accent-foreground font-semibold"
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:pl-64">
                <div className="h-full flex flex-col">
                    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Admin</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="font-medium text-foreground">{getActiveGroup()}</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="font-medium text-foreground">{getActiveLabel()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ModeToggle />
                            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="mx-auto space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">{getActiveLabel()}</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Manage your {getActiveLabel().toLowerCase()} data and settings.
                                </p>
                            </div>

                            <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                                <div className="p-4">
                                    {activeView === "shops" && (
                                        <DataManager collectionName="shops" title="Shops" schema={shopSchema} hideTitle />
                                    )}
                                    {activeView === "events" && (
                                        <DataManager collectionName="events" title="Events" schema={eventSchema} hideTitle />
                                    )}
                                    {activeView === "hotels" && (
                                        <DataManager collectionName="hotels" title="Hotels" schema={hotelSchema} hideTitle />
                                    )}
                                    {activeView === "places" && (
                                        <DataManager collectionName="places" title="Places" schema={placeSchema} hideTitle />
                                    )}
                                    {activeView === "news" && (
                                        <DataManager collectionName="news" title="News" schema={newsSchema} hideTitle />
                                    )}
                                    {activeView === "blogs" && (
                                        <DataManager collectionName="blogs" title="Blogs" schema={blogSchema} hideTitle />
                                    )}
                                    {activeView === "experience" && (
                                        <DataManager collectionName="experience" title="Experience" schema={experienceSchema} hideTitle />
                                    )}
                                    {activeView === "users" && (
                                        <DataManager collectionName="users" title="Users" schema={userSchema} hideTitle />
                                    )}
                                    {activeView === "notifications" && (
                                        <DataManager collectionName="notifications" title="Notifications" schema={notificationSchema} hideTitle />
                                    )}
                                    {activeView === "contact" && (
                                        <DataManager collectionName="contact-form" title="Contact Submissions" schema={contactSchema} hideTitle />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
