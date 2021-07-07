import React from 'react'

const FeedbackBanner = () => {
  const { hostname, pathname } = window.location

  return (
    <div className="feedback-banner" data-test="feedback-banner">
      <a
        href={`https://eu.surveymonkey.com/r/GYB8Y9Q?source=${hostname}${pathname}`}
        className="govuk-link govuk-link--inverse govuk-!-font-size-16"
        target="_blank"
        rel="noopener noreferrer"
      >
        Give feedback on this service
      </a>
    </div>
  )
}

export default FeedbackBanner
