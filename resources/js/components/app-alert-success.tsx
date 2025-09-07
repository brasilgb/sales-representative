import { useState, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function AlertSuccess({ message, className }: { message?: string, className?: string }) {

    return (

        <div className={`p-4 ${className}`}>
            <Alert className="border-green-200 bg-green-50 text-green-800 relative">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="flex items-center justify-between">
                <span>{message}</span>
            </AlertDescription>
        </Alert>
        </div>
    )
}
