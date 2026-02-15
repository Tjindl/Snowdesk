import { useEffect, useRef } from 'react'

/**
 * Canvas-based realistic snowfall with:
 * - 3 depth layers (far, mid, near) with parallax
 * - Wind gusts that shift over time
 * - Variable sizes, speeds, and opacity
 * - Gentle horizontal wobble (sine wave)
 * - Snowflakes fade in at top and out at bottom
 */
export default function Snowfall() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        let animId
        let flakes = []

        const FLAKE_COUNT = 120

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // Wind state — drifts slowly
        let wind = 0
        let windTarget = 0
        let windTimer = 0

        const createFlake = (startAtTop = false) => {
            // 3 layers: 0=far(small,slow), 1=mid, 2=near(big,fast)
            const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.6 ? 1 : 2
            const layerScale = [0.4, 0.7, 1.0][layer]

            return {
                x: Math.random() * canvas.width,
                y: startAtTop ? -(Math.random() * 100) : Math.random() * canvas.height,
                radius: (Math.random() * 1.8 + 0.6) * layerScale,
                speed: (Math.random() * 0.15 + 0.1) * layerScale + 0.08,
                wobbleAmp: Math.random() * 0.15 + 0.05,
                wobbleFreq: Math.random() * 0.003 + 0.001,
                wobblePhase: Math.random() * Math.PI * 2,
                opacity: (Math.random() * 0.35 + 0.2) * layerScale,
                layer,
            }
        }

        // Initialize flakes spread across screen
        flakes = Array.from({ length: FLAKE_COUNT }, () => createFlake(false))

        const draw = (timestamp) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update wind — very gentle
            windTimer += 1
            if (windTimer > 400 + Math.random() * 600) {
                windTarget = (Math.random() - 0.5) * 0.4
                windTimer = 0
            }
            wind += (windTarget - wind) * 0.002

            for (let i = 0; i < flakes.length; i++) {
                const f = flakes[i]

                // Movement — mostly downward with very gentle drift
                const wobble = Math.sin(timestamp * f.wobbleFreq + f.wobblePhase) * f.wobbleAmp
                f.y += f.speed
                f.x += wobble + wind * [0.15, 0.3, 0.5][f.layer]

                // Fade at edges
                let alpha = f.opacity
                if (f.y < 30) alpha *= f.y / 30
                if (f.y > canvas.height - 50) alpha *= (canvas.height - f.y) / 50

                // Draw
                ctx.beginPath()
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`
                ctx.fill()

                // Reset if off screen
                if (f.y > canvas.height + 10 || f.x < -50 || f.x > canvas.width + 50) {
                    flakes[i] = createFlake(true)
                    flakes[i].x = Math.random() * (canvas.width + 100) - 50
                }
            }

            animId = requestAnimationFrame(draw)
        }

        animId = requestAnimationFrame(draw)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99,
                pointerEvents: 'none',
            }}
        />
    )
}
