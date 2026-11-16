import subprocess, glob, json, sys
# (clip no, in, out, transition INTO the next shot: seconds; 0.042 = hard cut)
SHOTS = [
    ('N01', 0.3, 4.6, 0.8),   # dawn over the Metn hills
    (26,    0.4, 3.4, 0.6),   # a newborn holds a finger
    ('N02', 0.5, 3.6, 0.5),   # the bus climbs the mountain
    (25,    0.8, 4.0, 0.042), # the first goodbye
    ('N03', 0.2, 3.3, 0.042), # through the gate
    ('N05', 0.5, 2.9, 0.042), # clay
    (23,    0.3, 2.4, 0.042), # blocks
    (18,    0.2, 2.2, 0.042), # light through a prism
    ('N06', 0.6, 2.4, 0.042), # the flame
    (21,    0.8, 2.6, 0.042), # the flask
    ('N04', 0.5, 2.8, 0.042), # the corridor
    ('N07', 0.3, 2.1, 0.042), # sparks
    ( 2,    1.2, 2.9, 0.042), # the printer
    ('N11', 0.0, 1.7, 0.042), # the jump shot
    ('N14', 0.8, 2.6, 0.042), # the book
    ('N08', 2.2, 4.8, 0.042), # the telescope
    ('N10', 0.4, 2.6, 0.042), # the exam hall
    (24,    1.0, 2.8, 0.042), # late night
    ('N09', 1.0, 4.0, 0.5),   # the piano, alone
    (28,    0.8, 3.2, 0.042), # a hand on the podium
    ('N12', 0.5, 4.2, 0.042), # caps over the field
    (27,    1.0, 4.4, 0.6),   # hands, held again
    ('N13', 0.3, 5.0, 0.8),   # out through the gate, into the city
    ( 1,    0.8, 5.0, 0),     # the city at night
]
FADE = 0.8
W, H = 1920, 1080
inputs, chains = [], []
for i, (n, a, b, _) in enumerate(SHOTS):
    f = f'nv/{n}.mp4' if isinstance(n, str) else glob.glob(f'src/{n:02d}_*.mp4')[0]
    inputs += ['-ss', str(a), '-t', str(b - a), '-i', f]
    chains.append(f'[{i}:v]fps=24,scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,'
                  f'crop={W}:{H},setsar=1,format=yuv420p,settb=AVTB[v{i}]')
# xfade chain
cur, t, starts = 'v0', 0.0, [0.0]
dur0 = SHOTS[0][2] - SHOTS[0][1]
total = dur0
for i in range(1, len(SHOTS)):
    d = SHOTS[i - 1][3]
    off = total - d
    starts.append(round(off, 3))
    out = f'x{i}'
    tr = 'fade' if d > 0.1 else 'fade'
    chains.append(f'[{cur}][v{i}]xfade=transition={tr}:duration={d}:offset={off:.3f}[{out}]')
    total = off + (SHOTS[i][2] - SHOTS[i][1])
    cur = out
grade = ("eq=contrast=1.07:saturation=0.72:gamma=0.97,"
         "curves=all='0/0.04 0.25/0.22 0.5/0.48 1/0.95',"
         "colorbalance=rs=-0.01:bs=0.025:rh=0.03:bh=-0.03,"
         "vignette=angle=PI/4.6,"
         "noise=alls=6:allf=t+u,"
         f"fade=t=in:st=0:d={FADE}:color=0x0b0b2a,fade=t=out:st={total-FADE:.3f}:d={FADE}:color=0x0b0b2a,format=yuv420p")
chains.append(f'[{cur}]{grade}[out]')
cmd = ['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', ';'.join(chains), '-map', '[out]',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-an', 'master.mp4']
subprocess.run(cmd, check=True)
json.dump({'total': round(total, 3), 'starts': starts, 'clips': [s[0] for s in SHOTS]}, open('timeline.json', 'w'), indent=1)
print(total, starts)
