"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { useUser } from "../../contexts/user-context"
import { LogOut, UserIcon, History, Heart, MapPin, Star, User } from "lucide-react"
import { CheckIcon, PencilIcon, PencilSimpleLineIcon } from "@phosphor-icons/react"

const navigationItems = [
  { id: "account", label: "Account", icon: User },
  { id: "demo-history", label: "Demo History", icon: History },
  { id: "wishlist-demos", label: "Wishlist Demos", icon: Heart },
  { id: "saved-addresses", label: "Saved Addresses", icon: MapPin },
  { id: "reviews", label: "Reviews", icon: Star },
]

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("account")

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <Button variant="outline" size="sm">
                Change Profile Information
              </Button>
            </div>

            <div className="flex justify-center mb-6">
              {user.picture ? (
                <div className="relative">
                  <img
                    src={user.picture || "/placeholder.svg"}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-gray-200"
                  />
                  <Button variant='ghost' size="sm" className="absolute rounded-full -bottom-1 -right-1  w-8 h-8 p-0">
                  <PencilIcon size={20} />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg font-medium">{user.name}</p>
              </div>

              {/* <div>
                <label className="text-sm font-medium text-gray-600">Date Of Birth</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">20/01/2022</p>
              </div> */}

              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <div className="mt-1 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="gender" defaultChecked className="text-green-500" />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="gender" />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <div className="mt-1 flex items-center gap-2">
                  {/* <span className="px-2 py-1 bg-red-500 text-white text-xs rounded"></span> */}
                  <p className="p-3 bg-gray-50 rounded-lg flex-1 flex items-center gap-2">
                    {user.phone }
                    {user.phoneVerified && <CheckIcon weight="bold" size={16} className="text-green-500" />}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                  {user.email || "abcd1234@email.com"}
                  {user.emailVerified && <CheckIcon weight="bold" size={16} className="text-green-500" />}
                </p>
              </div>
            </div>
          </div>
        )
      case "demo-history":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Demo History</h2>
            <div className="text-center py-12 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No demo history available</p>
            </div>
          </div>
        )
      case "wishlist-demos":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Wishlist Demos</h2>
            <div className="text-center py-12 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No wishlist demos available</p>
            </div>
          </div>
        )
      case "saved-addresses":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No saved addresses available</p>
            </div>
          </div>
        )
      case "reviews":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Reviews</h2>
            <div className="text-center py-12 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reviews available</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Side Panel */}
          <div className="lg:w-80 w-full">
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {user.picture ? (
                    <img
                      src={user.picture || "/placeholder.svg"}
                      alt={user.name}
                      className="w-16 h-16 rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hello</p>
                  <CardTitle className="text-lg font-bold">{user.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                {/* Navigation Items */}
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}

                {/* Logout Button */}
                <div className="pt-4 border-t mt-4">
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

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-6">{renderTabContent()}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
