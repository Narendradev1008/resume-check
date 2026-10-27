import { useEffect, useMemo, useState } from 'react'
import '../styles/interview.scss'
import '../styles/resume-preview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import GenerationProgress from '../components/GenerationProgress.jsx'
import { useAuth } from '../../auth/hooks/useAuth.js'

const icon = { dashboard: '⌂', practice: '◉', questions: '▤', roadmap: '♧', resources: '▱', settings: '⚙', calendar: '□', arrow: '›', code: '</>', people: '♙', file: '▤', check: '✓', database: '▱' }
const STEPS = [{ at: 0, label: 'Preparing your profile' }, { at: 25, label: 'AI is tailoring your resume' }, { at: 55, label: 'Formatting your resume for ATS' }, { at: 75, label: 'Creating your PDF' }]

const getIcon = (label = '') => {
    const value = label.toLowerCase()
    if (value.includes('behav')) return icon.people
    if (value.includes('system')) return icon.database
    if (value.includes('coding') || value.includes('algorithm')) return icon.code
    return icon.check
}

function QuestionModal({ title, questions, onClose }) {
    const [openIndex, setOpenIndex] = useState(0)
    return <div className='report-modal' role='presentation' onMouseDown={onClose}>
        <section className='report-modal__content' role='dialog' aria-modal='true' aria-labelledby='question-title' onMouseDown={(e) => e.stopPropagation()}>
            <header><div><p className='dashboard__eyebrow'>Practice library</p><h2 id='question-title'>{title}</h2></div><button onClick={onClose} aria-label='Close questions'>×</button></header>
            <div className='question-list'>
                {questions.length ? questions.map((item, index) => <article className='dashboard-question' key={index}>
                    <button onClick={() => setOpenIndex(openIndex === index ? -1 : index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.question}</strong><b>{openIndex === index ? '−' : '+'}</b></button>
                    {openIndex === index && <div><p><strong>What they are looking for</strong>{item.intention}</p><p><strong>A strong answer</strong>{item.answer}</p></div>}
                </article>) : <p className='empty-state'>Your question set will appear here once it is ready.</p>}
            </div>
        </section>
    </div>
}

function PlanModal({ roadmap, onClose }) {
    return <div className='report-modal' role='presentation' onMouseDown={onClose}>
        <section className='report-modal__content plan-modal' role='dialog' aria-modal='true' aria-labelledby='plan-title' onMouseDown={(e) => e.stopPropagation()}>
            <header><div><p className='dashboard__eyebrow'>Your personalized schedule</p><h2 id='plan-title'>Preparation Plan</h2></div><button onClick={onClose} aria-label='Close preparation plan'>×</button></header>
            <div className='plan-list'>{roadmap.map((day) => <article key={day.day}><span>Day {day.day}</span><div><h3>{day.focus}</h3><ul>{day.tasks?.map((task, index) => <li key={index}>{task}</li>)}</ul></div></article>)}</div>
        </section>
    </div>
}

function Interview() {
    const [activeNav, setActiveNav] = useState('dashboard')
    const [questionGroup, setQuestionGroup] = useState(null)
    const [isPlanOpen, setIsPlanOpen] = useState(false)
    const [isDownloadingResume, setIsDownloadingResume] = useState(false)
    const [resumePdfUrl, setResumePdfUrl] = useState(null)
    const [resumeError, setResumeError] = useState('')
    const { report, getReportById, loading, getResumePdf, getResumePreviewUrl, getResumeDownloadUrl } = useInterview()
    const { handleLogout } = useAuth()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    useEffect(() => { if (interviewId) getReportById(interviewId) }, [interviewId])
    const allQuestions = useMemo(() => [...(report?.technicalQuestions || []), ...(report?.behavioralQuestions || [])], [report])
    if (isDownloadingResume) return <GenerationProgress title='Your resume is being prepared' steps={STEPS} />
    if (loading || !report) return <main className='loading-screen'><div className='loading-spinner' /></main>

    const score = report.matchScore || 0
    const roadmap = report.preparationPlan || []
    const gaps = report.skillGaps || []
    const navItems = [['dashboard', 'Dashboard'], ['practice', 'Practice'], ['questions', 'Questions'], ['roadmap', 'Roadmap'], ['resources', 'Resources']]
    const areas = gaps.slice(0, 5).map((gap) => gap.skill)
    const categories = [
        { name: 'Technical', caption: `${report.technicalQuestions?.length || 0} questions`, symbol: icon.database, questions: report.technicalQuestions || [] },
        { name: 'Behavioral', caption: `${report.behavioralQuestions?.length || 0} questions`, symbol: icon.people, questions: report.behavioralQuestions || [] },
        { name: 'Preparation plan', caption: `${roadmap.length} focused days`, symbol: icon.file, questions: allQuestions },
    ]
    const jumpTo = (id) => { setActiveNav(id); document.getElementById(id === 'dashboard' ? 'overview' : id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
    const hasSavedResume = report.generatedResume?.status === 'ready'
    const viewResume = async () => {
        setResumeError('')
        setIsDownloadingResume(true)
        try {
            const url = hasSavedResume
                ? await getResumePreviewUrl(interviewId)
                : await getResumePdf(interviewId)
            setResumePdfUrl(url)
        } catch (error) {
            setResumeError(error.response?.data?.message || 'We could not generate your resume right now. Please try again.')
        } finally {
            setIsDownloadingResume(false)
        }
    }
    const downloadResume = async () => { const url = await getResumeDownloadUrl(interviewId); const link = document.createElement('a'); link.href = url; link.download = `resume_${interviewId}.pdf`; link.click() }

    return <main className='interview-dashboard'>
        <aside className='dashboard-sidebar'>
            <button className='brand' onClick={() => jumpTo('dashboard')}><i>✦</i><span>prepwise</span></button>
            <nav>{navItems.map(([id, label]) => <button key={id} onClick={() => jumpTo(id)} className={activeNav === id ? 'active' : ''}><b>{icon[id]}</b><span>{label}</span></button>)}</nav>
            <div className='dashboard-sidebar__bottom'><button onClick={() => setActiveNav('settings')}><b>{icon.settings}</b><span>Settings</span></button><button onClick={async () => { await handleLogout(); navigate('/login') }}><b>↪</b><span>Logout</span></button></div>
        </aside>
        <section className='dashboard-main'>
            <header className='dashboard-topbar'><div><p className='dashboard__eyebrow'>Your interview workspace</p><h1>Interview Report</h1></div><div className='topbar-actions'><button className='plan-button' onClick={() => setIsPlanOpen(true)}><span>{icon.calendar}</span> View Preparation Plan <em>{icon.arrow}</em></button></div></header>
            <section id='overview' className='overview-card dashboard-card'>
                <div className='score-column'><div className='score-ring' style={{ '--score': `${score * 3.6}deg` }}><div><strong>{score}%</strong><span>Match Score</span></div></div></div>
                <div className='role-summary'><p className='dashboard__eyebrow'>Target role</p><h2>{report.title || 'Your target role'}</h2><div className='skill-pills'>{areas.length ? areas.map((area) => <span key={area}>{area}</span>) : <span>Interview preparation</span>}</div><div className='role-summary__actions'><button className='resume-button' onClick={viewResume}>{hasSavedResume ? 'View resume' : 'Generate tailored resume'} <span>↗</span></button><button className='text-action' onClick={() => navigate('/')}>← Back to plans</button></div>{resumeError && <p className='resume-error' role='alert'>{resumeError}</p>}</div>
            </section>
            <section id='roadmap' className='roadmap-section dashboard-card'><header><h2>{roadmap.length || 7} Day Preparation Roadmap</h2><button className='text-action' onClick={() => setIsPlanOpen(true)}>View Plan {icon.arrow}</button></header><div className='roadmap-track'>
                {roadmap.length ? roadmap.map((day, index) => <article className={`roadmap-item ${index === 0 ? 'roadmap-item--active' : ''}`} key={day.day}><span>Day {day.day}</span><div className='roadmap-icon'>{getIcon(day.focus)}</div><h3>{day.focus}</h3><p>{day.tasks?.[0] || 'Build confidence'}</p><div className='roadmap-progress'><i style={{ width: `${index === 0 ? 100 : Math.max(12, 78 - index * 15)}%` }} /></div></article>) : <p className='empty-state'>Your personalized roadmap will be ready here shortly.</p>}
            </div></section>
            <section className='dashboard-grid'>
                <article id='questions' className='dashboard-card question-categories'><header><h2>Top Interview Questions</h2><button className='text-action' onClick={() => setQuestionGroup({ title: 'All interview questions', questions: allQuestions })}>View All {icon.arrow}</button></header>{categories.map((category) => <button key={category.name} onClick={() => setQuestionGroup({ title: category.name, questions: category.questions })}><i>{category.symbol}</i><span><strong>{category.name}</strong><small>{category.caption}</small></span><b>{icon.arrow}</b></button>)}</article>
            </section>
        </section>
        {questionGroup && <QuestionModal {...questionGroup} onClose={() => setQuestionGroup(null)} />}
        {isPlanOpen && <PlanModal roadmap={roadmap} onClose={() => setIsPlanOpen(false)} />}
        {resumePdfUrl && <div className='resume-preview' role='dialog' aria-modal='true' aria-label='Generated resume preview'><div className='resume-preview__dialog'><header className='resume-preview__header'><div><h2>Your generated resume</h2><p>Review it before downloading.</p></div><button className='resume-preview__close' onClick={() => setResumePdfUrl(null)} aria-label='Close'>×</button></header><iframe className='resume-preview__document' src={resumePdfUrl} title='Generated resume PDF' /><footer className='resume-preview__footer'><button className='button' onClick={() => setResumePdfUrl(null)}>Close</button><button className='button primary-button' onClick={downloadResume}>Download PDF</button></footer></div></div>}
    </main>
}

export default Interview
