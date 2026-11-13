import { useState, useEffect } from 'react';
import { GetSavedJobsApi, SaveJobApi, RemoveSavedJobApi } from '../../utils/Api';
import { useAuth } from '../../utils/Auth';

export function useSavedJobs(jobId) {
    const { token } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isPending, setIsPending] = useState(false);

    
    useEffect(() => {
        let cancelled = false;

        async function checkSaved() {
            const saved = await GetSavedJobsApi(token);
            if (cancelled) return;
            setIsSaved(saved.some((job) => job.jobId === jobId));
        }

        checkSaved();
        return () => { cancelled = true; };
    }, [jobId, token]);

    async function toggleSave() {
        if (isPending) return;

        const wasSaved = isSaved;
        setIsPending(true);
        setIsSaved(!wasSaved); 

        const success = wasSaved
            ? await RemoveSavedJobApi(jobId, token)
            : await SaveJobApi(jobId, token);

        if (!success) setIsSaved(wasSaved); 

        setIsPending(false);
    }

    return { isSaved, isPending, toggleSave };
}
