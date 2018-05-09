package uk.gov.justice.digital.hmpps.keyworker.mockapis.mockResponses


class OffenderSentencesResponse {

    static response = '''
[
    {
      "bookingId": -34,
      "offenderNo": "A1178RS",
      "firstName": "FRED",
      "lastName": "QUIMBY",
      "dateOfBirth": "1945-01-10",
      "agencyLocationId": "LEI",
      "agencyLocationDesc": "LEEDS",
      "internalLocationDesc": "H-1",
      "sentenceDetail": {
        "bookingId": -34
      }
    },
    {
      "bookingId": -33,
      "offenderNo": "A5577RS",
      "firstName": "HAROLD",
      "lastName": "LLOYD",
      "dateOfBirth": "1945-01-10",
      "agencyLocationId": "LEI",
      "agencyLocationDesc": "LEEDS",
      "internalLocationDesc": "H-1",
      "sentenceDetail": {
        "bookingId": -33
      }
    },
    {
      "bookingId": -18,
      "offenderNo": "Z0018ZZ",
      "firstName": "NICK",
      "lastName": "TALBOT",
      "dateOfBirth": "1970-01-01",
      "agencyLocationId": "LEI",
      "agencyLocationDesc": "LEEDS",
      "internalLocationDesc": "H-1",
      "facialImageId": -18,
      "sentenceDetail": {
        "bookingId": -18,
        "sentenceStartDate": "2016-11-17",
        "homeDetentionCurfewActualDate": "2019-09-19",
        "releaseDate": "2019-09-19"
      }
    },
    {
      "bookingId": -24,
      "offenderNo": "Z0024ZZ",
      "firstName": "LUCIUS",
      "lastName": "FOX",
      "dateOfBirth": "1958-01-01",
      "agencyLocationId": "LEI",
      "agencyLocationDesc": "LEEDS",
      "internalLocationDesc": "H-1",
      "facialImageId": -24,
      "sentenceDetail": {
        "bookingId": -24,
        "sentenceStartDate": "2017-07-07",
        "actualParoleDate": "2022-06-06",
        "confirmedReleaseDate": "2022-02-02",
        "releaseDate": "2022-02-02"
      }
    }
  ]
'''
}
