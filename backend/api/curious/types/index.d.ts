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
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    a2LevelIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    accessHEIndicator?: boolean
    /**
     * Actual Guided Learning Hours allocated to course
     * @type {number}
     * @memberof LearnerEducation
     */
    actualGLH?: number
    /**
     * The sequence number of Course for a learner
     * @type {number}
     * @memberof LearnerEducation
     */
    aimSequenceNumber?: number
    /**
     *
     * @type {boolean}
     * @memberof LearnerEducation
     */
    alevelIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    asLevelIndicator?: boolean
    /**
     * Actual attended Guided Learning Hours by learner on course
     * @type {number}
     * @memberof LearnerEducation
     */
    attendedGLH?: number
    /**
     * Course completion Status
     * @type {string}
     * @memberof LearnerEducation
     */
    completionStatus?: string
    /**
     * Unique Course Code
     * @type {string}
     * @memberof LearnerEducation
     */
    courseCode?: string
    /**
     * Course Name
     * @type {string}
     * @memberof LearnerEducation
     */
    courseName?: string
    /**
     * Post code of a location where this course is getting delivered
     * @type {string}
     * @memberof LearnerEducation
     */
    deliveryLocationPostCode?: string
    /**
     * Course Delivery Method
     * @type {string}
     * @memberof LearnerEducation
     */
    deliveryMethodType?: LearnerEducationDeliveryMethodType
    /**
     * Employment Outcome gained status associated with the course (with training, without training)
     * @type {string}
     * @memberof LearnerEducation
     */
    employmentOutcome?: string
    /**
     * Establishment (prison) identifier
     * @type {number}
     * @memberof LearnerEducation
     */
    establishmentId?: number
    /**
     * Establishment (prison) name
     * @type {string}
     * @memberof LearnerEducation
     */
    establishmentName?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    functionalSkillsIndicator?: boolean
    /**
     * Funding adjustment hours from prior learning
     * @type {number}
     * @memberof LearnerEducation
     */
    fundingAdjustmentPriorLearning?: number
    /**
     * Funding Model for a Course
     * @type {string}
     * @memberof LearnerEducation
     */
    fundingModel?: string
    /**
     * Funding type for a course
     * @type {string}
     * @memberof LearnerEducation
     */
    fundingType?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    gceIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    gcsIndicator?: boolean
    /**
     * Indicates if the course is accredited
     * @type {boolean}
     * @memberof LearnerEducation
     */
    isAccredited?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    keySkillsIndicator?: boolean
    /**
     * Learners aim on Course
     * @type {string}
     * @memberof LearnerEducation
     */
    learnersAimType?: string
    /**
     * Actual Course end date
     * @type {string}
     * @memberof LearnerEducation
     */
    learningActualEndDate?: string
    /**
     * Planned Course end date
     * @type {string}
     * @memberof LearnerEducation
     */
    learningPlannedEndDate?: string
    /**
     * Course start date
     * @type {string}
     * @memberof LearnerEducation
     */
    learningStartDate?: string
    /**
     * Number of Guided Learning hours from LRS
     * @type {number}
     * @memberof LearnerEducation
     */
    lrsGLH?: number
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerEducation
     */
    miNotionalNVQLevelV2?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    occupationalIndicator?: boolean
    /**
     * Outcome of Course
     * @type {string}
     * @memberof LearnerEducation
     */
    outcome?: string
    /**
     * Outcome grade of Course
     * @type {string}
     * @memberof LearnerEducation
     */
    outcomeGrade?: string
    /**
     * Withdrawal reason if the learner withdraws from course
     * @type {string}
     * @memberof LearnerEducation
     */
    prisonWithdrawalReason?: string
    /**
     * NOMIS Assigned Offender Number (Prisoner Identifier)
     * @type {string}
     * @memberof LearnerEducation
     */
    prn?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    qcfCertificateIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    qcfDiplomaIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    qcfIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerEducation
     */
    sectorSubjectAreaTier1?: string
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerEducation
     */
    sectorSubjectAreaTier2?: string
    /**
     * Course Indicator from LRS
     * @type {number}
     * @memberof LearnerEducation
     */
    subcontractedPartnershipUKPRN?: number
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerEducation
     */
    unitType?: string
    /**
     * Indicates if withdrawal is agreed or not
     * @type {boolean}
     * @memberof LearnerEducation
     */
    withdrawalReasonAgreed?: boolean
    /**
     * Withdrawal reason (defaulted to Other) populated for the courses which are withdrawn
     * @type {string}
     * @memberof LearnerEducation
     */
    withdrawalReasons?: string
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
