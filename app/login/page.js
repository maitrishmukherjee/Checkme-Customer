"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import { generateLoginOtp, validateLoginOtp, googleLogin, validateUserToken } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { useUser } from "../../contexts/user-context"
import { useAlert } from "../../contexts/alert-context"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
export default function LoginPage() {
  const { login, isAuthenticated } = useUser()
  const { showAlert } = useAlert()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [step, setStep] = useState("enter")
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [otpError, setOtpError] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        // Get user info from Google
        const userInfoResponse = await axios.get(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`,
        )

        const userData = {
          id: userInfoResponse.data.id,
          name: userInfoResponse.data.name,
          email: userInfoResponse.data.email,
          picture: userInfoResponse.data.picture,
        }

        // Optionally call backend googleLogin
        try {
          const { data } = await googleLogin({ email: userData.email, name: userData.name || "" })
          if (data && data.access_token) {
            localStorage.setItem("access_token", data.access_token)
          }
        } catch { }

        login(userData)
        router.push("/")
      } catch (error) {
        console.error("Login error:", error)
        showAlert("Google login failed. Please try again.", "error")
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      showAlert("Google login failed. Please try again.", "error")
    },
  })

  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) {
      showAlert("Enter a valid mobile number", "error")
      return
    }
    setSending(true)
    try {
      const { data } = await generateLoginOtp({ mobileno: phone, name: "" })
      // Prefill name if backend returns it
      const prefName = Array.isArray(data?.return_data) ? data.return_data?.[0]?.username || "" : ""
      setName(prefName)
      setStep("verify")
      showAlert("OTP sent successfully", "success")
    } catch (e) {
      showAlert("Failed to send OTP", "error")
    } finally {
      setSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      showAlert("Enter the OTP", "error")
      return
    }
    
    // Simple OTP validation - only accept 123456
    if (otp !== "123456") {
      setOtpError("Invalid OTP. Please enter 123456")
      return
    }
    
    setVerifying(true)
    try {
      const { data } = await validateLoginOtp({ mobileno: phone, otp, name: name || "" })
      // API returns nested data with tokens
      const rd = Array.isArray(data?.return_data) ? data.return_data[0] : undefined
      const token =
        (typeof data === "string" ? data : data?.access_token || data?.token || data?.jwt) ||
        rd?.access_token ||
        ""
      const refreshToken = rd?.refresh_token || ""
      if (token) localStorage.setItem("access_token", token)
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken)

      // Build local user from response if present
      let userData = {
        id: phone,
        name: (name || rd?.username || "").trim(),
        email: "",
        picture: "",
        user_reg: rd?.user_reg,
        otp_status: rd?.otp_status,
        new_user_created: rd?.new_user_created,
      }

      // Hydrate from validate_user to use canonical fields
      try {
        const valid = await validateUserToken()
        const v = Array.isArray(valid?.data?.return_data) ? valid.data.return_data[0] : null
        if (v) {
          userData = {
            id: v?.user_id ?? phone,
            name: (name || v?.first_name || "").trim(),
            email: v?.email && v.email !== "NA" ? v.email : "",
            picture: v?.user_photo || "",
            phone: v?.phone || phone,
            phoneVerified: !!v?.phone_verified,
            emailVerified: !!v?.email_verified,
            gender: v?.gender || "",
          }
        }
      } catch { }

      login(userData)
      router.push("/")
    } catch (e) {
      showAlert("OTP verification failed", "error")
    } finally {
      setVerifying(false)
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Login to CheckMe</CardTitle>
            <p className="text-muted-foreground">Welcome back! Please login to continue</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium">Mobile number</label>
              <input
                type="tel"
                className="w-full h-10 px-3 rounded-md border bg-background"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={sending || verifying || step === "verify"}
              />
              {step === "enter" && (
                <Button onClick={handleSendOtp} disabled={sending || !phone} className="w-full">
                  {sending ? "Sending OTP..." : "Send OTP"}
                </Button>
              )}
            </div>

            {step === "verify" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Enter OTP</label>
                <InputOTP 
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value)
                    setOtpError("") // Clear error when OTP changes
                  }}
                  disabled={verifying}
                  containerClassName="w-full"
                >
                  <InputOTPGroup className="w-full justify-between">
                    <InputOTPSlot index={0} className="flex-1 h-12" />
                    <InputOTPSlot index={1} className="flex-1 h-12" />
                    <InputOTPSlot index={2} className="flex-1 h-12" />
                    <InputOTPSlot index={3} className="flex-1 h-12" />
                    <InputOTPSlot index={4} className="flex-1 h-12" />
                    <InputOTPSlot index={5} className="flex-1 h-12" />
                  </InputOTPGroup>
                </InputOTP>
                {otpError && (
                  <p className="text-sm text-red-600 mt-1">{otpError}</p>
                )}
                <label className="block text-sm font-medium">Your Name</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-md border bg-background"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={verifying}
                />
                <div className="flex gap-2">
                  <Button onClick={handleVerifyOtp} disabled={verifying || !otp} className="flex-1">
                    {verifying ? "Verifying..." : "Verify & Login"}
                  </Button>
                  <Button variant="outline" onClick={() => setStep("enter")} disabled={verifying}>
                    Edit number
                  </Button>
                </div>
              </div>
            )}
            {/* <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 text-base bg-background text-foreground border border-border hover:bg-accent flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? "Signing in..." : "Login with Google"}
            </Button> */}

            <div className="text-center text-sm text-muted-foreground">
              By logging in, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
