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
  }
  /**
   *
   * @export
   * @interface CurrentWork
   */
  export interface CurrentWork {
    /**
     * Offender Number
     * @type {string}
     * @memberof CurrentWork
     */
    offenderNo: string
    /**
     * work activities
     * @type {array}
     * @memberof CurrentWork
     */
    workActivities: WorkActivity[]
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
   * @interface LearningDifficultiesDisabilities
   */
  interface LearningDifficultiesDisabilities {
    /**
     * Establishment Name
     * @type {string}
     * @memberof LearningDifficultiesDisabilities
     */
    establishmentName?: string
    /**
     * Primary learning difficulty or disability
     * @type {string}
     * @memberof LearningDifficultiesDisabilities
     */
    primaryLDD?: Array
    /**
     * Additional learning difficulties or disabilities
     * @type {string}
     * @memberof LearningDifficultiesDisabilities
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
}
