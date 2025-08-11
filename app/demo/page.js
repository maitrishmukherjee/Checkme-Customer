"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import AddressDialog from "../../components/address-dialog"
import { products } from "../../lib/data"

export default function DemoPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("product")
  const product = productId ? products.find((p) => p.id === Number.parseInt(productId)) : null

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })
  const [address, setAddress] = useState(null)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Demo booking:", { ...formData, address, product: product?.name })
    setSubmitted(true)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Demo Booked Successfully!</h1>
            <p className="text-gray-600 mb-6">
              {"We'll contact you soon to schedule your demo"}
              {product && ` for ${product.name}`}.
            </p>
            <Button onClick={() => setSubmitted(false)}>Book Another Demo</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Book a Demo</CardTitle>
            {product && (
              <p className="text-gray-600">
                Request a demo for: <strong>{product.name}</strong>
              </p>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <div className="mt-2">
                  {address ? (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">{address.name}</p>
                      <p className="text-sm text-gray-600">
                        {address.street}
                        <br />
                        {address.city}, {address.state} {address.zipCode}
                        <br />
                        {address.country}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => setShowAddressDialog(true)}
                      >
                        Change Address
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setShowAddressDialog(true)}>
                      Add Address
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your requirements..."
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                Book Demo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <AddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onAddressSelect={setAddress}
        title="Demo Address"
      />
    </div>
  )
}
