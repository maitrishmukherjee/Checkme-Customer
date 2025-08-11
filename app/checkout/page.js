"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import AddressDialog from "../../components/address-dialog"
import { useCart } from "../../contexts/cart-context"

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart()
  const [address, setAddress] = useState(null)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert("Order placed successfully!")
    clearCart()
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No items to checkout</h1>
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
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
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => setShowAddressDialog(true)}
                  >
                    Change Address
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAddressDialog(true)}>Add Shipping Address</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    value={paymentData.name}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData((prev) => ({ ...prev, cvv: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!address}>
                  Place Order - ${getCartTotal().toFixed(2)}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onAddressSelect={setAddress}
        title="Shipping Address"
      />
    </div>
  )
}
