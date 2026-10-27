import React, { useState,useEffect, useRef } from 'react'
import "../styles/home.scss"
import { useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'
import GenerationProgress from '../components/GenerationProgress.jsx'
import { useAuth } from '../../auth/hooks/useAuth.js'

const REPORT_GENERATION_STEPS = [
    { at: 0, label: "Uploading your details" },
    { at: 25, label: "Reading your resume and job description" },
    { at: 50, label: "AI is analysing your profile" },
    { at: 72, label: "Creating interview questions and preparation plan" },
    { at: 86, label: "Saving your interview report" },
]


function Home() {

    const { loading, generateReport, reports, getReports, removeReport } = useInterview()
    const { user, handleLogout } = useAuth()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ isGeneratingReport, setIsGeneratingReport ] = useState(false)
    const [ deletingReportId, setDeletingReportId ] = useState(null)
    const [ reportPendingDeletion, setReportPendingDeletion ] = useState(null)
    const [ successMessage, setSuccessMessage ] = useState("")
    const [ deleteError, setDeleteError ] = useState("")
    const [ generationError, setGenerationError ] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()
    useEffect(() => {
        getReports().catch((error) => {
            console.error("Unable to load interview plans:", error)
        })
    }, [])

    useEffect(() => {
        if (!successMessage) return

        const timeoutId = window.setTimeout(() => setSuccessMessage(""), 4000)
        return () => window.clearTimeout(timeoutId)
    }, [successMessage])

    const handleGenerateReport = async () => {
        setGenerationError("")
        const resumeFile = resumeInputRef.current?.files?.[0]
        if (!jobDescription.trim()) {
            setGenerationError("Please add the target job description.")
            return
        }
        if (!resumeFile && !selfDescription.trim()) {
            setGenerationError("Upload a PDF resume or add a short self-description.")
            return
        }
        setIsGeneratingReport(true)
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            navigate(`/interview/${data._id}`)
        } catch (error) {
            setGenerationError(error.response?.data?.message || "We could not create your interview plan. Please try again.")
        } finally {
            setIsGeneratingReport(false)
        }
    }

    const logoutUser = async () => {
        await handleLogout()
        navigate('/login')
    }

    const promptDeleteReport = (event, report) => {
        event.stopPropagation()
        setDeleteError("")
        setReportPendingDeletion(report)
    }

    const handleDeleteReport = async () => {
        if (!reportPendingDeletion) return

        const report = reportPendingDeletion
        setDeletingReportId(report._id)
        try {
            await removeReport(report._id)
            setReportPendingDeletion(null)
            setSuccessMessage("Interview plan deleted successfully.")
        } catch (error) {
            console.error("Unable to delete interview report:", error)
            const message = error.response?.data?.message || "We couldn't delete this interview plan. Please try again."
            setDeleteError(message)
        } finally {
            setDeletingReportId(null)
        }
    }

   if (loading ) {
    if (isGeneratingReport) {
        return <GenerationProgress title="Your interview report is being prepared" steps={REPORT_GENERATION_STEPS} />
    }

    return (
        <main className="loading-screen">
            <div className="loading-spinner"></div>
        </main>
    );
}
  return (
    <div className='home-page'>

<div className="home-page__topbar">
    <span>Signed in as {user?.username || user?.name || "User"}</span>
    <button type="button" className="logout-button" onClick={logoutUser}>Logout</button>
</div>

{/* Page Header */}
<header className='page-header'>
    <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
    <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
    {generationError && <p className='page-header__error' role='alert'>{generationError}</p>}
</header>

{/* Main Card */}
<div className='interview-card'>
    <div className='interview-card__body'>

        {/* Left Panel - Job Description */}
        <div className='panel panel--left'>
            <div className='panel__header'>
                <span className='panel__icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                </span>
                <h2>Target Job Description</h2>
                <span className='badge badge--required'>Required</span>
            </div>
            <textarea
                onChange={(e) => { setJobDescription(e.target.value) }}
                className='panel__textarea'
                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                maxLength={5000}
            />
            <div className='char-counter'>0 / 5000 chars</div>
        </div>

        {/* Vertical Divider */}
        <div className='panel-divider' />

        {/* Right Panel - Profile */}
        <div className='panel panel--right'>
            <div className='panel__header'>
                <span className='panel__icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </span>
                <h2>Your Profile</h2>
            </div>

            {/* Upload Resume */}
            <div className='upload-section'>
                <label className='section-label'>
                    Upload Resume
                    <span className='badge badge--best'>Best Results</span>
                </label>
                <label className='dropzone' htmlFor='resume'>
                    <span className='dropzone__icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                    </span>
                    <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                    <p className='dropzone__subtitle'>PDF only (Max 3MB)</p>
                    <input ref={resumeInputRef} hidden type='file' id='resume' name='resume' aria-label="drag and drop resume" accept='application/pdf,.pdf' />
                </label>
            </div>

            {/* OR Divider */}
            <div className='or-divider'><span>OR</span></div>

            {/* Quick Self-Description */}
            <div className='self-description'>
                <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                <textarea
                    onChange={(e) => { setSelfDescription(e.target.value) }}
                    id='selfDescription'
                    name='selfDescription'
                    className='panel__textarea panel__textarea--short'
                    placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                />
            </div>

            {/* Info Box */}
            <div className='info-box'>
                <span className='info-box__icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                </span>
                <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
            </div>
        </div>
    </div>

    {/* Card Footer */}
    <div className='interview-card__footer'>
        <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
        <button
            onClick={handleGenerateReport}
            className='generate-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
            Generate My Interview Strategy
        </button>
    </div>
</div>

{/* Recent Reports List */}
  {reports.length > 0 && (
    <section className='recent-reports'>
        <h2>My Recent Interview Plans</h2>
        <ul className='reports-list'>
            {reports.map(report => (
                <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                    <div className='report-item__header'>
                        <h3>{report.title || 'Untitled Position'}</h3>
                        <button
                            type='button'
                            className='report-item__delete'
                            onClick={(event) => promptDeleteReport(event, report)}
                            disabled={deletingReportId === report._id}
                            aria-label={`Delete ${report.title || 'interview plan'}`}
                        >
                            {deletingReportId === report._id ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                    <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                    <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                </li>
            ))}
            </ul>
        </section>
    )}   

    {/* Page Footer */}
    <footer className='page-footer'>
        <a href='#'>Privacy Policy</a>
        <a href='#'>Terms of Service</a>
        <a href='#'>Help Center</a>
    </footer>

    {reportPendingDeletion && (
        <div className='delete-modal-backdrop' role='presentation' onMouseDown={() => !deletingReportId && setReportPendingDeletion(null)}>
            <section
                className='delete-modal'
                role='dialog'
                aria-modal='true'
                aria-labelledby='delete-modal-title'
                onMouseDown={(event) => event.stopPropagation()}
            >
                <h2 id='delete-modal-title'>Delete interview plan?</h2>
                <p>
                    Delete <strong>{reportPendingDeletion.title || 'this interview plan'}</strong>? This action cannot be undone.
                </p>
                {deleteError && <p className='delete-modal__error'>{deleteError}</p>}
                <div className='delete-modal__actions'>
                    <button
                        type='button'
                        className='delete-modal__cancel'
                        onClick={() => { setReportPendingDeletion(null); setDeleteError("") }}
                        disabled={Boolean(deletingReportId)}
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        className='delete-modal__confirm'
                        onClick={handleDeleteReport}
                        disabled={Boolean(deletingReportId)}
                    >
                        {deletingReportId ? 'Deleting…' : 'Delete plan'}
                    </button>
                </div>
            </section>
        </div>
    )}

    {successMessage && (
        <div className='status-toast' role='status' aria-live='polite'>
            {successMessage}
        </div>
    )}
</div>
  )
}

export default Home
