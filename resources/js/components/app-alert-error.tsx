import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AlertError({ message, className }: { message?: string, className?: string }) {

    return (

        <div className={`p-4 ${className}`}>
            <Alert className="border-red-200 bg-red-50 text-red-600 relative">
                <AlertCircle className="h-4 w-4"/>
                <AlertDescription className="flex items-center justify-between">
                    <span className="text-red-800">{message}</span>
                </AlertDescription>
            </Alert>
        </div>
    )
}
