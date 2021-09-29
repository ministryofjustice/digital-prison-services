declare namespace eswe {
  /**
   *
   * @export
   * @interface WorkActivity
   */
  export interface WorkActivity {
    /**
     * bookingId
     * @type {number}
     * @memberof WorkActivity
     */
    bookingId?: number
    /**
     * agencyLocationId
     * @type {string}
     * @memberof WorkActivity
     */
    agencyLocationId?: string
    /**
     * agencyLocationDescription
     * @type {string}
     * @memberof WorkActivity
     */
    agencyLocationDescription?: string
    /**
     * description
     * @type {string}
     * @memberof WorkActivity
     */
    description?: string
    /**
     * startDate
     * @type {string}
     * @memberof WorkActivity
     */
    startDate?: string
    /**
     * endDate
     * @type {string}
     * @memberof WorkActivity
     */
    endDate?: string
    /**
     * isCurrentActivity
     * @type {boolean}
     * @memberof WorkActivity
     */
    isCurrentActivity: boolean
    /**
     * endReasonDescription
     * @type {boolean}
     * @memberof WorkActivity
     */
    endReasonDescription?: string
    /**
     * endCommentText
     * @type {boolean}
     * @memberof WorkActivity
     */
    endCommentText?: string
  }

  /**
   *
   * @export
   * @interface WorkHistory
   */
  export interface WorkHistory {
    /**
     * Offender Number
     * @type {string}
     * @memberof WorkHistory
     */
    offenderNo: string
    /**
     * work activities
     * @type {array}
     * @memberof WorkHistory
     */
    workActivities: WorkActivity[]
  }

  /**
   *
   * @export
   * @interface OffenderCurrentWork
   */
  export interface OffenderCurrentWork {
    /**
     * workHistoryPresent
     * @type {boolean}
     * @memberof OffenderCurrentWork
     */
    workHistoryPresent: boolean
    /**
     * currentJobs
     * @type {array}
     * @memberof OffenderCurrentWork
     */
    currentJobs: OffenderCurrentWorkDetail[]
  }
  /**
   *
   * @export
   * @interface OffenderCurrentWorkDetail
   */
  export interface OffenderCurrentWorkDetail {
    /**
     * label
     * @type {string}
     * @memberof OffenderCurrentWorkDetail
     */
    label: string
    /**
     * value
     * @type {string}
     * @memberof OffenderCurrentWorkDetail
     */
    value: string
  }
  /**
   *
   * @export
   * @interface CurrentCoursesEnhanced
   */
  interface CurrentCoursesEnhanced {
    /**
     * Courses
     * @type {any}
     * @memberof CurrentCoursesEnhanced
     */
    currentCourseData?: Array
    /**
     * Historical courses
     * @type {string}
     * @memberof CurrentCoursesEnhanced
     */
    historicalCoursesPresent?: boolean
  }
  /**
   *
   * @export
   * @interface Neurodiversities
   */
  interface Neurodiversities {
    /**
     * Establishment Name
     * @type {string}
     * @memberof Neurodiversities
     */
    establishmentName?: string
    /**
     * Primary learning difficulty or disability
     * @type {string}
     * @memberof Neurodiversities
     */
    primaryLDD?: Array
    /**
     * Additional learning difficulties or disabilities
     * @type {string}
     * @memberof Neurodiversities
     */
    additionalLDD?: Array
  }
  /**
   *
   * @export
   * @interface FunctionalSkillsLevels
   */
  export interface FunctionalSkillsLevels {
    /**
     *
     * @type {Array<FunctionalSkillsLevels>}
     * @memberof FunctionalSkillsLevels
     */
    english?: Array
    /**
     *
     * @type {Array<FunctionalSkillsLevels>}
     * @memberof FunctionalSkillsLevels
     */
    maths?: Array
    /**
     *
     * @type {Array<FunctionalSkillsLevels>}
     * @memberof FunctionalSkillsLevels
     */
    digiLit?: Array
  }

  /**
   *
   * @export
   * @interface CurrentCoursesEnhanced
   */
  interface CurrentCoursesEnhanced {
    /**
     * Courses
     * @type {any}
     * @memberof CurrentCoursesEnhanced
     */
    currentCourseData?: Array
    /**
     * Historical courses
     * @type {string}
     * @memberof CurrentCoursesEnhanced
     */
    historicalCoursesPresent?: boolean
  }

  /**
   *
   * @export
   * @interface LearnerEducationFullDetails
   */
  interface LearnerEducationFullDetails {
    /**
     * Type
     * @type {string}
     * @memberof LearnerEducationFullDetails
     */
    type?: string
    /**
     * Course name
     * @type {string}
     * @memberof LearnerEducationFullDetails
     */
    courseName?: string
    /**
     * Location - establishment
     * @type {string}
     * @memberof LearnerEducationFullDetails
     */
    location?: string
    /**
     * Date from (learning start date)
     * @type {string}
     * @memberof LearnerEducationFullDetails
     */
    dateFrom?: string
    /**
     * Date to (learning end date, or planned end date)
     * @type {string}
     * @memberof LearnerEducationFullDetails
     */
    dateTo?: string
    /**
     * Outcome
     * @type {string}
     * @memberof LearnerEducationFullDetails
     */
    outcome?: string
    /**
     * Outcome details
     * @type {string}
     * @memberof LearnerEducationFullDetails
     */
    outcomeDetails?: string
  }

  /**
   *
   * @export
   * @interface workHistoryFullDetails
   */
  interface workHistoryFullDetails {
    /**
     * Role
     * @type {string}
     * @memberof workHistoryFullDetails
     */
    role: string
    /**
     * location
     * @type {string}
     * @memberof workHistoryFullDetails
     */
    location: string
    /**
     * start date
     * @type {string}
     * @memberof workHistoryFullDetails
     */
    startDate: string
    /**
     * end date
     * @type {string}
     * @memberof workHistoryFullDetails
     */
    endDate: string
  }

  /**
   *
   * @export
   * @interface LearnerGoals
   */
  export interface LearnerGoals {
    /**
     *
     * @type {Array<string>}
     * @memberof LearnerGoals
     */
    employmentGoals: Array
    /**
     *
     * @type {Array<string>}
     * @memberof LearnerGoals
     */
    personalGoals: Array
    /**
     *
     * @type {Array<string>}
     * @memberof LearnerGoals
     */
    longTermGoals: Array
    /**
     *
     * @type {Array<string>}
     * @memberof LearnerGoals
     */
    shortTermGoals: Array
  }
}
