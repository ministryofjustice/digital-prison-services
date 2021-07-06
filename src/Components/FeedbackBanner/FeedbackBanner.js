import React from 'react'
import { useLocation } from 'react-router-dom'

const FeedbackBanner = () => {
  const location = useLocation()

  return (
    <div className="feedback-banner" data-test="feedback-banner">
      <a
        href={`https://eu.surveymonkey.com/r/GYB8Y9Q?source=${location.pathname}`}
        className="govuk-link govuk-link--inverse"
        target="_blank"
        rel="noopener noreferrer"
      >
        Give feedback on this service
      </a>
    </div>
  )
}

export default FeedbackBanner
