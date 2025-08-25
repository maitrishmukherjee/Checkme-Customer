"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ArrowRight, Phone, Mail } from "lucide-react"
import { FacebookLogoIcon, InstagramLogoIcon, LinkedinLogoIcon } from "@phosphor-icons/react"

export default function Footer() {
  const [email, setEmail] = useState("")

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      console.log("Newsletter signup:", email)
      setEmail("")
    }
  }

  return (
    <footer className="bg-gray-900 text-white mt-auto w-full">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Newsletter Section */}
          <div className="sm:col-span-2">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 leading-tight">
              From Flash Sales To Tech Tips— Get Everything In One Smart Email
            </h3>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-row  items-start sm:items-center gap-3 mb-6">
              <div className="relative w-3/4 md:w-1/2 lg:w-2/3">
                <Input
                  type="email"
                  placeholder="Enter your mail..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    borderBottomColor: email ? '#ffffff' : '#4b5563'
                  }}
                />
              </div>
              <Button 
                type="submit" 
                size="sm" 
                className="bg-white text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <ArrowRight/>
              </Button>
            </form>
            
            {/* Social Media Links */}
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-gray-700 rounded-full hover:bg-gray-600 text-gray-300 hover:text-white p-2"
              >
                <FacebookLogoIcon size={30} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-gray-700 rounded-full hover:bg-gray-600 text-gray-300 hover:text-white p-2"
              >
                <InstagramLogoIcon size={30} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-gray-700 rounded-full hover:bg-gray-600 text-gray-300 hover:text-white p-2"
              >
                <LinkedinLogoIcon size={30} />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Need Help</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Orders</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Demos</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">FAQ's</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg">More Info</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Terms and Conditions</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Privacy Policy</a></li>
            </ul>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Explore</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Categories</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Brands</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">+91 9900177356</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">contact@chqme.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Powered By */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-400">
            <div className="text-center sm:text-left">
              Copyright © 2025 Cavitak Global Commerce Pvt Ltd. All rights reserved.
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}
