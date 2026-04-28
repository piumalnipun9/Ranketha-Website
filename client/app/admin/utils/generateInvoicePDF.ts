'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { UIOrder } from '../types'

interface OrderDetails {
    order: UIOrder
    items?: Array<{
        name: string
        quantity: number
        price: number
    }>
    shippingAddress?: {
        fullName: string
        addressLine1: string
        addressLine2?: string
        city: string
        district: string
        zipCode: string
        phoneNumber?: string
    } | null
    customerEmail?: string
}

export function generateInvoicePDF(details: OrderDetails) {
    const { order, items = [], shippingAddress, customerEmail } = details

    // Create new PDF document
    const doc = new jsPDF()

    // Company header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('ROBO CLUB', 105, 25, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Electronics & Robotics Store', 105, 32, { align: 'center' })
    doc.text('Email: roboclub.main@gmail.com | Phone: 0729557537', 105, 38, { align: 'center' })

    // Invoice title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 105, 55, { align: 'center' })

    // Invoice details box
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(14, 65, 85, 35, 2, 2, 'F')
    doc.roundedRect(107, 65, 85, 35, 2, 2, 'F')

    // Left box - Invoice Info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Invoice Details', 18, 73)
    doc.setFont('helvetica', 'normal')
    doc.text(`Invoice #: ${order.id.slice(0, 8).toUpperCase()}`, 18, 82)
    doc.text(`Date: ${order.date}`, 18, 89)
    doc.text(`Status: ${order.status}`, 18, 96)

    // Right box - Customer Info
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To', 112, 73)
    doc.setFont('helvetica', 'normal')
    doc.text(`${order.customer}`, 112, 82)
    if (customerEmail) {
        doc.text(`${customerEmail}`, 112, 89)
    }
    if (shippingAddress) {
        let yPos = customerEmail ? 96 : 89
        doc.text(`${shippingAddress.city}, ${shippingAddress.district}`, 112, yPos)
    }

    // Shipping Address (if available)
    if (shippingAddress) {
        doc.setFont('helvetica', 'bold')
        doc.text('Shipping Address:', 14, 115)
        doc.setFont('helvetica', 'normal')
        doc.text(shippingAddress.fullName, 14, 122)
        doc.text(shippingAddress.addressLine1, 14, 129)
        if (shippingAddress.addressLine2) {
            doc.text(shippingAddress.addressLine2, 14, 136)
        }
        doc.text(`${shippingAddress.city}, ${shippingAddress.district} ${shippingAddress.zipCode}`, 14, shippingAddress.addressLine2 ? 143 : 136)
        if (shippingAddress.phoneNumber) {
            doc.text(`Phone: ${shippingAddress.phoneNumber}`, 14, shippingAddress.addressLine2 ? 150 : 143)
        }
    }

    // Order Notes (if available)
    let tableStartY = 125
    if (shippingAddress) {
        tableStartY = shippingAddress.addressLine2 ? 160 : 150
        if (shippingAddress.phoneNumber) tableStartY += 7
    }

    if (order.notes) {
        doc.setFont('helvetica', 'bold')
        doc.text('Order Notes:', 14, tableStartY)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const splitNotes = doc.splitTextToSize(order.notes, 180)
        doc.text(splitNotes, 14, tableStartY + 7)
        tableStartY += 7 + (splitNotes.length * 5) + 10
        doc.setFontSize(10)
    }

    // Items table
    const tableData = items.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.quantity.toString(),
        `LKR ${item.price.toFixed(2)}`,
        `LKR ${(item.quantity * item.price).toFixed(2)}`
    ])

    autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Item', 'Qty', 'Unit Price', 'Total']],
        body: tableData.length > 0 ? tableData : [['', 'No items available', '', '', '']],
        theme: 'striped',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 9
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            1: { cellWidth: 80 },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 35 },
            4: { halign: 'right', cellWidth: 35 }
        },
        margin: { left: 14, right: 14 }
    })

    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 40

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    let shipping = 0
    // Check for standard shipping method in tracking number
    if (order.trackingNumber?.includes('SHIPPING_METHOD:standard')) {
        // Free shipping for orders >= 10000, otherwise 500
        shipping = subtotal >= 10000 ? 0 : 500
    }

    // We calculate total ourselves because order.total in DB might only be the subtotal
    const total = subtotal + shipping

    // Totals section
    doc.setDrawColor(200, 200, 200)
    doc.line(107, finalY + 10, 192, finalY + 10)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal:', 140, finalY + 20)
    doc.text(`LKR ${subtotal.toFixed(2)}`, 188, finalY + 20, { align: 'right' })

    doc.text('Shipping:', 140, finalY + 28)
    doc.text(shipping === 0 ? 'Free' : `LKR ${shipping.toFixed(2)}`, 188, finalY + 28, { align: 'right' })

    doc.line(140, finalY + 32, 192, finalY + 32)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Total:', 140, finalY + 42)
    doc.text(`LKR ${total.toFixed(2)}`, 188, finalY + 42, { align: 'right' })

    // Payment instructions
    const paymentY = finalY + 60
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Details:', 14, paymentY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Bank: Hatton National Bank (Kurunegala Branch)', 14, paymentY + 8)
    doc.text('Account Name: Imansha Manuka', 14, paymentY + 15)
    doc.text('Account Number: 019020341693', 14, paymentY + 22)
    doc.text(`Reference: Order #${order.id.slice(0, 8).toUpperCase()}`, 14, paymentY + 29)

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('Thank you for your business!', 105, pageHeight - 20, { align: 'center' })
    doc.text('For inquiries, contact us at roboclub.main@gmail.com or 0729557537', 105, pageHeight - 14, { align: 'center' })

    // Save the PDF
    doc.save(`Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`)
}
