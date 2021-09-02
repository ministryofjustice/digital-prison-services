declare namespace curious {
  type AssessmentQualificationType = import('AssessmentQualificationType')
  type LearnerEducationDeliveryMethodType = import('LearnerEducationDeliveryMethodType')

  /**
   *
   * @export
   * @interface Assessment
   */
  export interface Assessment {
    /**
     * The date the assessment has been taken
     * @type {string}
     * @memberof Assessment
     */
    assessmentDate?: string
    /**
     * Assessment Grade
     * @type {string}
     * @memberof Assessment
     */
    qualificationGrade?: string
    /**
     * Assessment Type
     * @type {string}
     * @memberof Assessment
     */
    qualificationType?: AssessmentQualificationType
  }

  /**
   *
   * @export
   * @interface LearnerAssessment
   */
  export interface LearnerAssessment {
    /**
     * Establishment (prison) identifier
     * @type {number}
     * @memberof LearnerAssessment
     */
    establishmentId?: number
    /**
     * Establishment (prison) name
     * @type {string}
     * @memberof LearnerAssessment
     */
    establishmentName?: string
    /**
     *
     * @type {Assessment}
     * @memberof LearnerAssessment
     */
    qualification?: Assessment
  }

  /**
   *
   * @export
   * @interface LearnerEducation
   */
  export interface LearnerEducation {
    /**
     * Content
     * @type {Array}
     * @memberof LearnerEducation
     */
    content?: LearnerCourses[]
    /**
     * Number
     * @type {number}
     * @memberof LearnerEducation
     */
    number?: number
    /**
     * Size
     * @type {number}
     * @memberof LearnerEducation
     */
    size?: number
    /**
     * Total Elements
     * @type {number}
     * @memberof LearnerEducation
     */
    totalElements?: number
    /**
     * First entry
     * @type {number}
     * @memberof LearnerEducation
     */
    first?: boolean
    /**
     * Last entry
     * @type {boolean}
     * @memberof LearnerEducation
     */
    last?: boolean
    /**
     * Has content
     * @type {boolean}
     * @memberof LearnerEducation
     */
    hasContent?: boolean
    /**
     * Number of Element
     * @type {number}
     * @memberof LearnerEducation
     */
    numberOfElements?: number
    /**
     * Total number of pages
     * @type {number}
     * @memberof LearnerEducation
     */
    totalPages?: number
    /**
     * Empty
     * @type {string}
     * @memberof LearnerEducation
     */
    pageable?: Record<string, unknown>
    /**
     * Empty
     * @type {boolean}
     * @memberof LearnerEducation
     */
    empty?: boolean
  }

  /**
   *
   * @export
   * @interface LearnerCourses
   */
  export interface LearnerCourses {
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    a2LevelIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    accessHEIndicator?: boolean
    /**
     * Actual Guided Learning Hours allocated to course
     * @type {number}
     * @memberof LearnerCourses
     */
    actualGLH?: number
    /**
     * The sequence number of Course for a learner
     * @type {number}
     * @memberof LearnerCourses
     */
    aimSequenceNumber?: number
    /**
     *
     * @type {boolean}
     * @memberof LearnerCourses
     */
    alevelIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    asLevelIndicator?: boolean
    /**
     * Actual attended Guided Learning Hours by learner on course
     * @type {number}
     * @memberof LearnerCourses
     */
    attendedGLH?: number
    /**
     * Course completion Status
     * @type {string}
     * @memberof LearnerCourses
     */
    completionStatus?: string
    /**
     * Unique Course Code
     * @type {string}
     * @memberof LearnerCourses
     */
    courseCode?: string
    /**
     * Course Name
     * @type {string}
     * @memberof LearnerCourses
     */
    courseName?: string
    /**
     * Post code of a location where this course is getting delivered
     * @type {string}
     * @memberof LearnerCourses
     */
    deliveryLocationPostCode?: string
    /**
     * Course Delivery Method
     * @type {string}
     * @memberof LearnerCourses
     */
    deliveryMethodType?: LearnerEducationDeliveryMethodType
    /**
     * Employment Outcome gained status associated with the course (with training, without training)
     * @type {string}
     * @memberof LearnerCourses
     */
    employmentOutcome?: string
    /**
     * Establishment (prison) identifier
     * @type {number}
     * @memberof LearnerCourses
     */
    establishmentId?: number
    /**
     * Establishment (prison) name
     * @type {string}
     * @memberof LearnerCourses
     */
    establishmentName?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    functionalSkillsIndicator?: boolean
    /**
     * Funding adjustment hours from prior learning
     * @type {number}
     * @memberof LearnerCourses
     */
    fundingAdjustmentPriorLearning?: number
    /**
     * Funding Model for a Course
     * @type {string}
     * @memberof LearnerCourses
     */
    fundingModel?: string
    /**
     * Funding type for a course
     * @type {string}
     * @memberof LearnerCourses
     */
    fundingType?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    gceIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    gcsIndicator?: boolean
    /**
     * Indicates if the course is accredited
     * @type {boolean}
     * @memberof LearnerCourses
     */
    isAccredited?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    keySkillsIndicator?: boolean
    /**
     * Learners aim on Course
     * @type {string}
     * @memberof LearnerCourses
     */
    learnersAimType?: string
    /**
     * Actual Course end date
     * @type {string}
     * @memberof LearnerCourses
     */
    learningActualEndDate?: string
    /**
     * Planned Course end date
     * @type {string}
     * @memberof LearnerCourses
     */
    learningPlannedEndDate?: string
    /**
     * Course start date
     * @type {string}
     * @memberof LearnerCourses
     */
    learningStartDate?: string
    /**
     * Number of Guided Learning hours from LRS
     * @type {number}
     * @memberof LearnerCourses
     */
    lrsGLH?: number
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerCourses
     */
    miNotionalNVQLevelV2?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    occupationalIndicator?: boolean
    /**
     * Outcome of Course
     * @type {string}
     * @memberof LearnerCourses
     */
    outcome?: string
    /**
     * Outcome grade of Course
     * @type {string}
     * @memberof LearnerCourses
     */
    outcomeGrade?: string
    /**
     * Withdrawal reason if the learner withdraws from course
     * @type {string}
     * @memberof LearnerCourses
     */
    prisonWithdrawalReason?: string
    /**
     * NOMIS Assigned Offender Number (Prisoner Identifier)
     * @type {string}
     * @memberof LearnerCourses
     */
    prn?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    qcfCertificateIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    qcfDiplomaIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerCourses
     */
    qcfIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerCourses
     */
    sectorSubjectAreaTier1?: string
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerCourses
     */
    sectorSubjectAreaTier2?: string
    /**
     * Course Indicator from LRS
     * @type {number}
     * @memberof LearnerCourses
     */
    subcontractedPartnershipUKPRN?: number
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerCourses
     */
    unitType?: string
    /**
     * Indicates if withdrawal is agreed or not
     * @type {boolean}
     * @memberof LearnerCourses
     */
    withdrawalReasonAgreed?: boolean
    /**
     * Withdrawal reason (defaulted to Other) populated for the courses which are withdrawn
     * @type {string}
     * @memberof LearnerCourses
     */
    withdrawalReasons?: string
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
   * @interface LearnerProfile
   */
  interface LearnerProfile {
    /**
     * Establishment (prison) identifier
     * @type {number}
     * @memberof LearnerProfile
     */
    establishmentId?: number
    /**
     * Language status
     * @type {string}
     * @memberof LearnerProfile
     */
    languageStatus?: string
    /**
     * Rapid assessment date
     * @type {string}
     * @memberof LearnerProfile
     */
    rapidAssessmentDate?: string
    /**
     * In depth assessment date
     * @type {string}
     * @memberof LearnerProfile
     */
    inDepthAssessmentDate?: string
    /**
     * Establishment (prison) name
     * @type {string}
     * @memberof LearnerProfile
     */
    establishmentName?: string
    /**
     * Learner Self Assessment LDD and Health Problem
     * @type {string}
     * @memberof LearnerProfile
     */
    lddHealthProblem?: string
    /**
     * Planned Learning Hours
     * @type {number}
     * @memberof LearnerProfile
     */
    plannedHours?: number
    /**
     * Overall attainment level of learners that have achieved various combinations of qualifications
     * @type {string}
     * @memberof LearnerProfile
     */
    priorAttainment?: string
    /**
     * NOMIS Assigned Offender Number (Prisoner Identifier)
     * @type {string}
     * @memberof LearnerProfile
     */
    prn?: string
    /**
     *
     * @type {Array<Assessment>}
     * @memberof LearnerProfile
     */
    qualifications?: Array
    /**
     * Unique Learner Number
     * @type {string}
     * @memberof LearnerProfile
     */
    uln?: string
    /**
     * Additional LLDD and Health Problems
     * @type {Array<string>}
     * @memberof LearnerProfile
     */
    additionalLLDDAndHealthProblems?: Array
    /**
     * Primary LLDD and Health Problem
     * @type {string}
     * @memberof LearnerProfile
     */
    primaryLLDDAndHealthProblem?: string
  }

  /**
   *
   * @export
   * @interface LearnerLatestAssessment
   */
  export interface LearnerLatestAssessment {
    /**
     * NOMIS Assigned Offender Number (Prisoner Identifier)
     * @type {string}
     * @memberof LearnerLatestAssessment
     */
    prn: string
    /**
     *
     * @type {Array<LearnerAssessment>}
     * @memberof LearnerLatestAssessment
     */
    qualifications?: LearnerAssessment[]
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
   * @interface LearnerGoals
   */
  export interface LearnerGoals {
    /**
     * NOMIS Assigned Offender Number (Prisoner Identifier)
     * @type {string}
     * @memberof LearnerGoals
     */
    prn?: string
    /**
     *
     * @type {Array<string>}
     * @memberof LearnerGoals
     */
    employmentGoals?: Array
    /**
     *
     * @type {Array<string>}
     * @memberof LearnerGoals
     */
    personalGoals?: Array
    /**
     *
     * @type {Array<string>}
     * @memberof LearnerGoals
     */
    longTermGoals?: Array
    /**
     *
     * @type {Array<string>}
     * @memberof LearnerGoals
     */
    shortTermGoals?: Array
  }
}
