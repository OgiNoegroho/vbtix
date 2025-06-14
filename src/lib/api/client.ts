// src/lib/api/client.ts
export async function fetcher<T>(url: string): Promise<T> {
    try {
        console.log('🌐 Fetching:', url);
        const res = await fetch(url);

        if (!res.ok) {
            let errorInfo;
            try {
                errorInfo = await res.json();
                console.error('❌ Fetch error:', JSON.stringify({
                    url,
                    status: res.status,
                    statusText: res.statusText,
                    errorInfo
                }, null, 2));
            } catch (parseError) {
                errorInfo = { error: `HTTP ${res.status}: ${res.statusText}` };
                console.error('❌ Fetch error (failed to parse response):', JSON.stringify({
                    url,
                    status: res.status,
                    statusText: res.statusText,
                    parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
                }, null, 2));
            }
            
            const error = new Error(`An error occurred while fetching the data. Status: ${res.status}`);
            (error as any).info = errorInfo;
            (error as any).status = res.status;
            throw error;
        }

        const data = await res.json();
        console.log('✅ Fetch success:', url);
        return data;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            // Network error
            console.error('🌐 Network error:', JSON.stringify({
                url,
                message: error.message,
                name: error.name
            }, null, 2));
        } else if (error instanceof Error) {
            // Other errors (including our custom errors)
            console.error('🔥 Error during fetch:', JSON.stringify({
                url,
                message: error.message,
                name: error.name,
                status: (error as any).status,
                info: (error as any).info
            }, null, 2));
        } else {
            // Unknown error type
            console.error('❓ Unknown error during fetch:', JSON.stringify({
                url,
                error: String(error)
            }, null, 2));
        }
        throw error;
    }
}

// Fungsi untuk POST request
export async function postData<T>(url: string, data: any): Promise<T> {
    try {
        console.log('📤 POST:', url);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            let errorInfo;
            try {
                errorInfo = await res.json();
            } catch (parseError) {
                errorInfo = { error: `HTTP ${res.status}: ${res.statusText}` };
            }
            
            console.error('❌ POST error:', JSON.stringify({
                url,
                status: res.status,
                statusText: res.statusText,
                errorInfo
            }, null, 2));
            
            const error = new Error('An error occurred while posting the data.');
            (error as any).info = errorInfo;
            (error as any).status = res.status;
            throw error;
        }

        const result = await res.json();
        console.log('✅ POST success:', url);
        return result;
    } catch (error) {
        if (error instanceof Error) {
            console.error('🔥 POST error:', JSON.stringify({
                url,
                message: error.message,
                name: error.name
            }, null, 2));
        }
        throw error;
    }
}

// Fungsi untuk PUT request
export async function putData<T>(url: string, data: any): Promise<T> {
    try {
        console.log('🔄 PUT:', url);
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            let errorInfo;
            try {
                errorInfo = await res.json();
            } catch (parseError) {
                errorInfo = { error: `HTTP ${res.status}: ${res.statusText}` };
            }
            
            console.error('❌ PUT error:', JSON.stringify({
                url,
                status: res.status,
                statusText: res.statusText,
                errorInfo
            }, null, 2));
            
            const error = new Error('An error occurred while updating the data.');
            (error as any).info = errorInfo;
            (error as any).status = res.status;
            throw error;
        }

        const result = await res.json();
        console.log('✅ PUT success:', url);
        return result;
    } catch (error) {
        if (error instanceof Error) {
            console.error('🔥 PUT error:', JSON.stringify({
                url,
                message: error.message,
                name: error.name
            }, null, 2));
        }
        throw error;
    }
}

// Fungsi untuk DELETE request
export async function deleteData<T>(url: string): Promise<T> {
    try {
        console.log('🗑️ DELETE:', url);
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            let errorInfo;
            try {
                errorInfo = await res.json();
            } catch (parseError) {
                errorInfo = { error: `HTTP ${res.status}: ${res.statusText}` };
            }
            
            console.error('❌ DELETE error:', JSON.stringify({
                url,
                status: res.status,
                statusText: res.statusText,
                errorInfo
            }, null, 2));
            
            const error = new Error('An error occurred while deleting the data.');
            (error as any).info = errorInfo;
            (error as any).status = res.status;
            throw error;
        }

        const result = await res.json();
        console.log('✅ DELETE success:', url);
        return result;
    } catch (error) {
        if (error instanceof Error) {
            console.error('🔥 DELETE error:', JSON.stringify({
                url,
                message: error.message,
                name: error.name
            }, null, 2));
        }
        throw error;
    }
}