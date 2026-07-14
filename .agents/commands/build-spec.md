# Build a spec

- 1. Use the `/specify` skill to generate a new spec or to update an existing spec.
- 2. Use the `/codify` skill to implement the solution of the spec.
- 3. Use the `/codify` skill to implement the e2e verification of the spec.
- 4. Use the `/verify` skill to verify the solution of the spec.
- 5. If there are failed tests, 
  - 5.1 run again the `/codify` skill over the verification report.
  - 5.2 run again the `/verify` skill to verify the solution of the spec.
  - 5.3 If there are still failed tests, STOP and report the error to the user.
- 6. User the `/releasify` skill to release the spec , with the change log and version number.