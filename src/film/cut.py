import subprocess, glob, json, sys
# (clip no, in, out, transition INTO the next shot: seconds; 0.042 = hard cut)
SHOTS = [
    (14, 0.5, 4.0, 0.5),   # morning over the coast
    (36, 0.5, 3.6, 0.5),   # newborn holds a finger
    (25, 0.8, 4.3, 0.042), # the first goodbye at the door
    (34, 0.5, 3.5, 0.042), # walking to the teacher, Early Years
    (19, 1.0, 3.2, 0.042), # Montessori hands
    (32, 1.5, 4.3, 0.042), # the tower
    (35, 0.3, 2.7, 0.042), # microscope
    (21, 1.0, 3.0, 0.042), # flask
    ( 2, 2.0, 4.0, 0.042), # design + technology
    (37, 0.5, 3.4, 0.042), # running
    (33, 0.5, 3.1, 0.042), # library, friends
    (24, 1.0, 3.0, 0.042), # late night work
    (28, 1.0, 3.0, 0.042), # hand on the podium
    (31, 0.5, 3.6, 0.042), # the speech
    (17, 0.5, 2.8, 0.042), # caps
    (30, 0.3, 4.4, 0.5),   # the hug
    (27, 1.5, 4.6, 0.6),   # hands, held again
    (16, 0.5, 5.2, 0),     # evening over the coast
]
FADE = 0.8
W, H = 1920, 1080
inputs, chains = [], []
for i, (n, a, b, _) in enumerate(SHOTS):
    f = glob.glob(f'src/{n:02d}_*.mp4')[0]
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
grade = ("eq=contrast=1.05:saturation=0.86:gamma=0.98,"
         "curves=all='0/0.03 0.5/0.49 1/0.965',"
         "colorbalance=rs=0.015:bs=-0.02:rh=0.025:bh=-0.02,"
         "vignette=angle=PI/5.2,"
         "noise=alls=5:allf=t+u,"
         f"fade=t=in:st=0:d={FADE}:color=0x0b0b2a,fade=t=out:st={total-FADE:.3f}:d={FADE}:color=0x0b0b2a,format=yuv420p")
chains.append(f'[{cur}]{grade}[out]')
cmd = ['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', ';'.join(chains), '-map', '[out]',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-an', 'master.mp4']
subprocess.run(cmd, check=True)
json.dump({'total': round(total, 3), 'starts': starts, 'clips': [s[0] for s in SHOTS]}, open('timeline.json', 'w'), indent=1)
print(total, starts)
