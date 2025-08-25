"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { useUser } from "../../contexts/user-context"
import { LogOut, Mail, UserIcon, Phone } from "lucide-react"
import { CheckIcon } from "@phosphor-icons/react"

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {user.picture ? (
                <img
                  src={user.picture || "/placeholder.svg"}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium flex items-center gap-2">
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    {user.email || "Email not verified"}
                    {user.emailVerified && (
                      <span title="Email verified" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white"><CheckIcon weight="bold" size={12} /></span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center gap-2">{user.phone}
                  {user.phoneVerified && (
                      <span title="Email verified" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white"><CheckIcon weight="bold" size={12} /></span>
                    )}
                  </p>
                  
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
