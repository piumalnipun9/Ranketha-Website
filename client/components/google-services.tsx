import React from 'react'
import Script from 'next/script'

/**
 * Central place to inject Google services tags (Search Console, Analytics etc.)
 * Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in env if available.
 */
export default function GoogleServices() {
	const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
	return (
		<>
			{verification && (
				<meta name="google-site-verification" content={verification} />
			)}
			{/* Optional: place for GA/other scripts */}
		</>
	)
}
