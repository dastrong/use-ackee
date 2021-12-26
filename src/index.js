'use strict'

const { useMemo, useEffect } = require('react')
const ackeeTracker = require('ackee-tracker')

/**
 * Use Ackee in React.
 * Creates an instance once and a new record every time the pathname changes.
 * @param {?String} pathname - Current path.
 * @param {Object} environment - Object containing the URL of the Ackee server and the domain id.
 * @param {?Object} options - Ackee options.
 */
const useAckee = function(pathname, environment, options = {}) {
	const isServer = typeof window === 'undefined'

	const instance = useMemo(() => {
		// check if we're on the server
		if (isServer) return null
		// if the window is there, start an instance
		return ackeeTracker.create(environment.server, options)
	}, [ environment.server, options.detailed, options.ignoreLocalhost, options.ignoreOwnVisits, isServer ])

	useEffect(() => {
		// check if there is a valid instance
		if (!instance) return

		// check if pathname is valid
		if (typeof pathname !== 'string' || !pathname.startsWith('/')) return

		// get the desired attributes and build a url
		const attributes = ackeeTracker.attributes(options.detailed)
		const url = new URL(pathname, location)

		// create a new record and grab the stop function needed for SPA
		const { stop } = instance.record(environment.domainId, {
			...attributes,
			siteLocation: url.href,
		})

		// stop updating the visit duration when a user navigates to a new page
		return stop
	}, [ instance, pathname, environment.domainId ])
}

module.exports = useAckee
module.exports.useAckee = useAckee